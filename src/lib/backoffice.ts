import { supabase } from "@/integrations/supabase/client";
import { fetchProducts, type ProductWithSignedUrl } from "@/lib/products";

export type PurchaseStatus = "draft" | "ordered" | "received";

export type PurchaseItem = {
  id?: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit_cost: number;
};

export type PurchaseOrder = {
  id: string;
  supplier: string;
  reference: string | null;
  order_date: string;
  status: PurchaseStatus;
  notes: string | null;
  receipt_image: string | null;
  shipping_cost: number;
  created_at: string;
  items: PurchaseItem[];
};

export type AdminProduct = ProductWithSignedUrl & {
  cost_price: number;
  stock_qty: number;
};

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const [products, costs] = await Promise.all([
    fetchProducts(),
    supabase.from("product_costs").select("product_id, cost_price"),
  ]);
  const costMap = new Map<string, number>();
  (costs.data ?? []).forEach((c) => costMap.set(c.product_id, Number(c.cost_price)));
  return products.map((p) => ({
    ...p,
    cost_price: costMap.get(p.id) ?? 0,
    stock_qty: p.stock_qty ?? 0,
  }));
}

export async function saveProductCost(productId: string, cost: number) {
  const { error } = await supabase
    .from("product_costs")
    .upsert({ product_id: productId, cost_price: cost }, { onConflict: "product_id" });
  if (error) throw error;
}

export async function saveStockQty(productId: string, qty: number) {
  const { error } = await supabase
    .from("products")
    .update({ stock_qty: qty, in_stock: qty > 0 })
    .eq("id", productId);
  if (error) throw error;
}

/** Mark a product as sellable on pre-order (with a rough arrival window). */
export async function setPreorder(
  productId: string,
  preorder: boolean,
  eta: string | null,
) {
  const { error } = await supabase
    .from("products")
    .update({ preorder, preorder_eta: preorder ? eta : null })
    .eq("id", productId);
  if (error) throw error;
}

export async function fetchPurchaseOrders(): Promise<PurchaseOrder[]> {
  const { data, error } = await supabase
    .from("purchase_orders")
    .select(
      "id, supplier, reference, order_date, status, notes, receipt_image, shipping_cost, created_at, purchase_order_items(id, product_id, description, quantity, unit_cost)",
    )
    .order("order_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    supplier: row.supplier,
    reference: row.reference,
    order_date: row.order_date,
    status: row.status as PurchaseStatus,
    notes: row.notes,
    receipt_image: row.receipt_image,
    shipping_cost: Number(row.shipping_cost),
    created_at: row.created_at,
    items: (row.purchase_order_items ?? []).map((i) => ({
      id: i.id,
      product_id: i.product_id,
      description: i.description,
      quantity: i.quantity,
      unit_cost: Number(i.unit_cost),
    })),
  }));
}

export function orderTotal(po: Pick<PurchaseOrder, "items" | "shipping_cost">) {
  return (
    po.items.reduce((sum, i) => sum + i.quantity * i.unit_cost, 0) +
    (po.shipping_cost || 0)
  );
}

export async function savePurchaseOrder(
  po: Omit<PurchaseOrder, "id" | "created_at" | "items"> & { id?: string },
  items: PurchaseItem[],
) {
  const payload = {
    supplier: po.supplier,
    reference: po.reference,
    order_date: po.order_date,
    status: po.status,
    notes: po.notes,
    receipt_image: po.receipt_image,
    shipping_cost: po.shipping_cost,
  };

  let orderId = po.id;
  if (orderId) {
    const { error } = await supabase
      .from("purchase_orders")
      .update(payload)
      .eq("id", orderId);
    if (error) throw error;
    const { error: delErr } = await supabase
      .from("purchase_order_items")
      .delete()
      .eq("purchase_order_id", orderId);
    if (delErr) throw delErr;
  } else {
    const { data, error } = await supabase
      .from("purchase_orders")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    orderId = data.id;
  }

  const rows = items
    .filter((i) => i.description.trim() || i.product_id)
    .map((i) => ({
      purchase_order_id: orderId!,
      product_id: i.product_id,
      description: i.description,
      quantity: i.quantity,
      unit_cost: i.unit_cost,
    }));
  if (rows.length > 0) {
    const { error } = await supabase.from("purchase_order_items").insert(rows);
    if (error) throw error;
  }
  return orderId!;
}

export async function deletePurchaseOrder(id: string) {
  const { error } = await supabase.from("purchase_orders").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadReceipt(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `receipts/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

/** Downscale a photo/screenshot so the AI scan payload stays small and fast. */
export async function fileToScanDataUrl(file: File, maxSide = 1600): Promise<string> {
  const original = await fileToDataUrl(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not read image"));
      el.src = original;
    });
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    if (scale === 1 && original.length < 1_500_000) return original;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return original;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return original;
  }
}

/** Units already paid for but not yet received, per product id. */
export function incomingByProduct(orders: PurchaseOrder[]): Map<string, number> {
  const map = new Map<string, number>();
  orders
    .filter((o) => o.status !== "received")
    .forEach((o) =>
      o.items.forEach((i) => {
        if (!i.product_id) return;
        map.set(i.product_id, (map.get(i.product_id) ?? 0) + i.quantity);
      }),
    );
  return map;
}

