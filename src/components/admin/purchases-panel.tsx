import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Sparkles, Pencil, Loader2 } from "lucide-react";
import { formatZAR } from "@/lib/format";
import { PREORDER_WINDOWS } from "@/lib/products";
import {
  deletePurchaseOrder,
  fileToScanDataUrl,
  orderTotal,
  savePurchaseOrder,
  setPreorder,
  uploadReceipt,
  type AdminProduct,
  type PurchaseItem,
  type PurchaseOrder,
  type PurchaseStatus,
} from "@/lib/backoffice";

import { scanReceipt } from "@/lib/receipt.functions";
import { Field, inputCls } from "./product-form";

const STATUSES: PurchaseStatus[] = ["draft", "ordered", "received"];

type Props = {
  orders: PurchaseOrder[];
  products: AdminProduct[];
  isLoading: boolean;
  refetch: () => void;
};

export function PurchasesPanel({ orders, products, isLoading, refetch }: Props) {
  const [editing, setEditing] = useState<PurchaseOrder | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function handleDelete(po: PurchaseOrder) {
    if (!confirm(`Delete purchase from "${po.supplier || "unknown supplier"}"?`)) return;
    try {
      await deletePurchaseOrder(po.id);
      refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not delete");
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl text-silver-gradient">Purchases</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Log what you bought — or snap the receipt and let AI capture it.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded bg-gradient-to-r from-primary to-purple-glow px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New purchase
        </button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="rounded border border-border px-4 py-12 text-center text-muted-foreground">
          No purchase orders yet.
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((po) => (
            <div key={po.id} className="rounded border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">
                    {po.supplier || "Unknown supplier"}
                    {po.reference && (
                      <span className="text-muted-foreground"> · {po.reference}</span>
                    )}
                  </p>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {po.order_date} · {po.items.length} item
                    {po.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${
                      po.status === "received"
                        ? "bg-primary/15 text-primary"
                        : po.status === "ordered"
                          ? "bg-muted text-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {po.status}
                  </span>
                  <span className="font-serif text-lg text-silver-gradient">
                    {formatZAR(orderTotal(po))}
                  </span>
                  <button
                    onClick={() => {
                      setEditing(po);
                      setShowForm(true);
                    }}
                    className="rounded border border-border p-1.5 text-muted-foreground hover:border-primary hover:text-primary"
                    aria-label="Edit purchase"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(po)}
                    className="rounded border border-border p-1.5 text-muted-foreground hover:border-destructive hover:text-destructive"
                    aria-label="Delete purchase"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {po.items.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                  {po.items.map((i, idx) => (
                    <li key={i.id ?? idx} className="flex justify-between gap-3">
                      <span className="truncate">
                        {i.quantity} × {i.description || "Item"}
                      </span>
                      <span>{formatZAR(i.quantity * i.unit_cost)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <PurchaseForm
          order={editing}
          products={products}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            refetch();
          }}
        />
      )}
    </>
  );
}

function emptyItem(): PurchaseItem {
  return { product_id: null, description: "", quantity: 1, unit_cost: 0 };
}

function PurchaseForm({
  order,
  products,
  onClose,
  onSaved,
}: {
  order: PurchaseOrder | null;
  products: AdminProduct[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const runScan = useServerFn(scanReceipt);
  const [supplier, setSupplier] = useState(order?.supplier ?? "");
  const [reference, setReference] = useState(order?.reference ?? "");
  const [orderDate, setOrderDate] = useState(
    order?.order_date ?? new Date().toISOString().slice(0, 10),
  );
  const [status, setStatus] = useState<PurchaseStatus>(order?.status ?? "ordered");
  const [shipping, setShipping] = useState(String(order?.shipping_cost ?? 0));
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [receiptPath, setReceiptPath] = useState(order?.receipt_image ?? null);
  const [items, setItems] = useState<PurchaseItem[]>(
    order?.items.length ? order.items : [emptyItem()],
  );
  const [preorderIds, setPreorderIds] = useState<string[]>(
    products.filter((p) => p.preorder).map((p) => p.id),
  );
  const [preorderEta, setPreorderEta] = useState<string>(
    products.find((p) => p.preorder && p.preorder_eta)?.preorder_eta ??
      PREORDER_WINDOWS[1],
  );
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total =
    items.reduce((s, i) => s + i.quantity * i.unit_cost, 0) + (Number(shipping) || 0);

  function setItem(idx: number, patch: Partial<PurchaseItem>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  async function handleScreenshot(file: File) {
    setError(null);
    setScanning(true);
    try {
      const dataUrl = await fileToScanDataUrl(file);
      const result = await runScan({ data: { dataUrl } });
      if (result.supplier) setSupplier(result.supplier);
      if (result.reference) setReference(result.reference);
      if (result.order_date && /^\d{4}-\d{2}-\d{2}$/.test(result.order_date))
        setOrderDate(result.order_date);
      if (result.shipping_cost != null) setShipping(String(result.shipping_cost));
      if (result.notes) setNotes(result.notes);
      if (result.items.length > 0) {
        setItems(
          result.items.map((i) => {
            const match = products.find(
              (p) => p.name.toLowerCase() === i.description.trim().toLowerCase(),
            );
            return {
              product_id: match?.id ?? null,
              description: i.description,
              quantity: Math.max(1, Math.round(i.quantity || 1)),
              unit_cost: i.unit_cost || 0,
            };
          }),
        );
      } else {
        setError("Couldn't read any line items — please fill them in manually.");
      }
      try {
        setReceiptPath(await uploadReceipt(file));
      } catch {
        /* receipt storage is optional */
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await savePurchaseOrder(
        {
          ...(order ? { id: order.id } : {}),
          supplier,
          reference: reference || null,
          order_date: orderDate,
          status,
          notes: notes || null,
          receipt_image: receiptPath,
          shipping_cost: Number(shipping) || 0,
        },
        items,
      );
      const linked = [...new Set(items.map((i) => i.product_id).filter(Boolean))] as string[];
      for (const pid of linked) {
        const p = products.find((x) => x.id === pid);
        if (!p) continue;
        const want = preorderIds.includes(pid);
        if (want !== p.preorder || (want && p.preorder_eta !== preorderEta)) {
          await setPreorder(pid, want, preorderEta);
        }
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:rounded sm:p-6"
      >
        <h2 className="font-serif text-2xl text-silver-gradient">
          {order ? "Edit purchase" : "New purchase"}
        </h2>

        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded border border-dashed border-primary/50 bg-primary/5 p-4">
          {scanning ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <Sparkles className="h-5 w-5 text-primary" />
          )}
          <span className="text-sm text-foreground">
            {scanning ? "Reading your receipt…" : "Scan a receipt screenshot with AI"}
            <span className="block text-[11px] uppercase tracking-widest text-muted-foreground">
              Take a photo or upload a screenshot
            </span>
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={scanning}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleScreenshot(f);
              e.target.value = "";
            }}
          />
        </label>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Supplier">
            <input
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Reference">
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Order date">
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PurchaseStatus)}
              className={inputCls}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Marking a purchase as <span className="text-primary">received</span> adds its
          linked products back into stock.
        </p>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Items</p>
          <div className="mt-2 space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="rounded border border-border/70 p-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_5rem_7rem_auto] sm:items-center">
                  <input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => setItem(idx, { description: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="number"
                    min={1}
                    inputMode="numeric"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      setItem(idx, { quantity: Math.max(1, Number(e.target.value) || 1) })
                    }
                    className={inputCls}
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    placeholder="Unit cost"
                    value={item.unit_cost}
                    onChange={(e) => setItem(idx, { unit_cost: Number(e.target.value) || 0 })}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                    className="justify-self-end rounded border border-border p-2 text-muted-foreground hover:border-destructive hover:text-destructive"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <select
                  value={item.product_id ?? ""}
                  onChange={(e) => setItem(idx, { product_id: e.target.value || null })}
                  className={`${inputCls} mt-2`}
                >
                  <option value="">Not linked to a product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {item.product_id && (
                  <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={preorderIds.includes(item.product_id)}
                      onChange={(e) => {
                        const pid = item.product_id!;
                        setPreorderIds((prev) =>
                          e.target.checked
                            ? [...new Set([...prev, pid])]
                            : prev.filter((x) => x !== pid),
                        );
                      }}
                      className="h-4 w-4 accent-[var(--primary)]"
                    />
                    Sell this on the store as a pre-order
                  </label>
                )}
              </div>
            ))}
          </div>
          {items.some((i) => i.product_id && preorderIds.includes(i.product_id)) && (
            <div className="mt-3 max-w-xs">
              <Field label="Pre-order arrival window shown to customers">
                <select
                  value={preorderEta}
                  onChange={(e) => setPreorderEta(e.target.value)}
                  className={inputCls}
                >
                  {PREORDER_WINDOWS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}
          <button
            type="button"
            onClick={() => setItems((prev) => [...prev, emptyItem()])}
            className="mt-3 flex items-center gap-2 rounded border border-border px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" /> Add item
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Shipping / other costs (ZAR)">
            <input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Notes">
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <p className="mt-5 text-right font-serif text-2xl text-silver-gradient">
          {formatZAR(total)}
        </p>

        {error && (
          <p className="mt-4 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-border px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-gradient-to-r from-primary to-purple-glow px-4 py-2 text-xs font-medium uppercase tracking-widest text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save purchase"}
          </button>
        </div>
      </form>
    </div>
  );
}
