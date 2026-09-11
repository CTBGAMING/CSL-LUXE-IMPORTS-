import { supabase } from "@/integrations/supabase/client";

export type ProductCategory = "925 Silver" | "Stainless Steel" | "Watches";

export const CATEGORIES: ProductCategory[] = [
  "925 Silver",
  "Stainless Steel",
  "Watches",
];

export const PREORDER_WINDOWS = [
  "1-2 weeks",
  "2-3 weeks",
  "3-4 weeks",
  "4-6 weeks",
  "6-8 weeks",
] as const;

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: ProductCategory;
  image_url: string | null;
  images: string[];
  in_stock: boolean;
  stock_qty: number;
  preorder: boolean;
  preorder_eta: string | null;
};

/** Buyable when physically in stock, or offered as a pre-order. */
export function isAvailable(p: Pick<Product, "in_stock" | "preorder">) {
  return p.in_stock || p.preorder;
}

export type ProductWithSignedUrl = Product & {
  signed_image_url: string | null;
  signed_image_urls: string[];
};

async function signImagePaths(paths: string[]): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  if (paths.length === 0) return urlMap;
  const { data: signed } = await supabase.storage
    .from("product-images")
    .createSignedUrls(paths, 60 * 60);
  signed?.forEach((s) => {
    if (s.path && s.signedUrl) urlMap.set(s.path, s.signedUrl);
  });
  return urlMap;
}

function toSigned(row: Product, urlMap: Map<string, string>): ProductWithSignedUrl {
  const galleryPaths = [
    ...(row.image_url ? [row.image_url] : []),
    ...(row.images ?? []).filter((p) => p && p !== row.image_url),
  ];
  return {
    ...row,
    price: Number(row.price),
    images: row.images ?? [],
    signed_image_url: row.image_url ? urlMap.get(row.image_url) ?? null : null,
    signed_image_urls: galleryPaths
      .map((p) => urlMap.get(p))
      .filter((u): u is string => !!u),
  };
}

export async function fetchProducts(): Promise<ProductWithSignedUrl[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, category, image_url, images, in_stock, stock_qty, preorder, preorder_eta")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as unknown as Product[];

  const paths = new Set<string>();
  rows.forEach((r) => {
    if (r.image_url) paths.add(r.image_url);
    (r.images ?? []).forEach((p) => p && paths.add(p));
  });
  const urlMap = await signImagePaths([...paths]);

  return rows.map((r) => toSigned(r, urlMap));
}

export async function fetchProduct(id: string): Promise<ProductWithSignedUrl | null> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, category, image_url, images, in_stock, stock_qty, preorder, preorder_eta")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as unknown as Product;
  const paths = new Set<string>();
  if (row.image_url) paths.add(row.image_url);
  (row.images ?? []).forEach((p) => p && paths.add(p));
  const urlMap = await signImagePaths([...paths]);
  return toSigned(row, urlMap);
}
