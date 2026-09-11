import { useMemo, useState } from "react";
import { Minus, Plus, Check, Truck } from "lucide-react";
import { formatZAR } from "@/lib/format";
import {
  incomingByProduct,
  saveStockQty,
  type AdminProduct,
  type PurchaseOrder,
} from "@/lib/backoffice";

type Props = {
  products: AdminProduct[];
  orders: PurchaseOrder[];
  refetch: () => void;
};

const VIEWS = [
  { id: "instock", label: "In stock" },
  { id: "incoming", label: "On order" },
  { id: "out", label: "Out of stock" },
  { id: "all", label: "All" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

export function InventoryPanel({ products, orders, refetch }: Props) {
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [view, setView] = useState<ViewId>("instock");

  const incoming = useMemo(() => incomingByProduct(orders), [orders]);

  function qtyOf(p: AdminProduct) {
    return drafts[p.id] ?? p.stock_qty;
  }

  function bump(p: AdminProduct, delta: number) {
    setDrafts((d) => ({ ...d, [p.id]: Math.max(0, qtyOf(p) + delta) }));
  }

  async function commit(p: AdminProduct) {
    const qty = qtyOf(p);
    if (qty === p.stock_qty) return;
    setSavingId(p.id);
    try {
      await saveStockQty(p.id, qty);
      setDrafts((d) => {
        const next = { ...d };
        delete next[p.id];
        return next;
      });
      refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not update stock");
    } finally {
      setSavingId(null);
    }
  }

  const counts = {
    instock: products.filter((p) => p.stock_qty > 0).length,
    incoming: products.filter((p) => (incoming.get(p.id) ?? 0) > 0).length,
    out: products.filter((p) => p.stock_qty === 0).length,
    all: products.length,
  };

  const visible = products.filter((p) => {
    const inc = incoming.get(p.id) ?? 0;
    if (view === "instock") return p.stock_qty > 0;
    if (view === "incoming") return inc > 0;
    if (view === "out") return p.stock_qty === 0;
    return true;
  });

  const totalIncoming = [...incoming.values()].reduce((s, n) => s + n, 0);
  const totalInStock = products.reduce((s, p) => s + p.stock_qty, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-silver-gradient">Inventory</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalInStock} unit{totalInStock === 1 ? "" : "s"} on hand ·{" "}
          <span className="text-primary">{totalIncoming}</span> on order (available for
          pre-order).
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-widest transition ${
              view === v.id
                ? "border-primary text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {v.label} ({counts[v.id]})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((p) => {
          const qty = qtyOf(p);
          const dirty = qty !== p.stock_qty;
          const inc = incoming.get(p.id) ?? 0;
          return (
            <div
              key={p.id}
              className="flex flex-wrap items-center gap-3 rounded border border-border bg-card p-3"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                {p.signed_image_url && (
                  <img src={p.signed_image_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{p.name}</p>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  cost {formatZAR(p.cost_price)} · sell {formatZAR(p.price)} · profit{" "}
                  <span className="text-primary">{formatZAR(p.price - p.cost_price)}</span>
                </p>
                {inc > 0 && (
                  <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary">
                    <Truck className="h-3 w-3" /> {inc} on order
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => bump(p, -1)}
                  className="rounded border border-border p-2 text-muted-foreground hover:text-foreground"
                  aria-label="Decrease"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={qty}
                  onChange={(e) =>
                    setDrafts((d) => ({
                      ...d,
                      [p.id]: Math.max(0, Math.round(Number(e.target.value) || 0)),
                    }))
                  }
                  className="w-16 rounded border border-input bg-background px-2 py-2 text-center text-sm text-foreground outline-none focus:border-primary"
                />
                <button
                  onClick={() => bump(p, 1)}
                  className="rounded border border-border p-2 text-muted-foreground hover:text-foreground"
                  aria-label="Increase"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => commit(p)}
                  disabled={!dirty || savingId === p.id}
                  className="ml-1 rounded bg-gradient-to-r from-primary to-purple-glow p-2 text-primary-foreground disabled:opacity-30"
                  aria-label="Save stock"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="rounded border border-border px-4 py-12 text-center text-muted-foreground">
            Nothing here yet.
          </p>
        )}
      </div>
    </div>
  );
}
