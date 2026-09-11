import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatZAR } from "@/lib/format";
import type { AdminProduct } from "@/lib/backoffice";
import { ProductForm } from "./product-form";

type Props = {
  products: AdminProduct[];
  isLoading: boolean;
  refetch: () => void;
};

export function ProductsPanel({ products, isLoading, refetch }: Props) {
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function handleDelete(p: AdminProduct) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const toRemove = [...(p.image_url ? [p.image_url] : []), ...(p.images ?? [])];
    if (toRemove.length > 0) {
      await supabase.storage.from("product-images").remove(toRemove);
    }
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return alert(error.message);
    refetch();
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl text-silver-gradient">Products</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage the storefront catalog.</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded bg-gradient-to-r from-primary to-purple-glow px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : products.length === 0 ? (
        <p className="rounded border border-border px-4 py-12 text-center text-muted-foreground">
          No products yet. Add your first piece.
        </p>
      ) : (
        <div className="space-y-3 md:space-y-0 md:overflow-hidden md:rounded md:border md:border-border">
          <table className="hidden w-full text-sm md:table">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="px-4 py-3">
                    <div className="h-12 w-12 overflow-hidden rounded bg-muted">
                      {p.signed_image_url && (
                        <img
                          src={p.signed_image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatZAR(p.cost_price)}
                  </td>
                  <td className="px-4 py-3 text-silver">{formatZAR(p.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${
                        p.stock_qty > 0
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.stock_qty > 0 ? `${p.stock_qty} in stock` : "Sold out"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditing(p);
                          setShowForm(true);
                        }}
                        className="rounded border border-border p-1.5 text-muted-foreground hover:border-primary hover:text-primary"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="rounded border border-border p-1.5 text-muted-foreground hover:border-destructive hover:text-destructive"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.map((p) => (
            <div
              key={p.id}
              className="flex gap-3 rounded border border-border bg-card p-3 md:hidden"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
                {p.signed_image_url && (
                  <img src={p.signed_image_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{p.name}</p>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {p.category} · {p.stock_qty} in stock
                </p>
                <p className="mt-1 text-sm text-silver">
                  {formatZAR(p.price)}{" "}
                  <span className="text-xs text-muted-foreground">
                    cost {formatZAR(p.cost_price)}
                  </span>
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setEditing(p);
                    setShowForm(true);
                  }}
                  className="rounded border border-border p-2 text-muted-foreground"
                  aria-label="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  className="rounded border border-border p-2 text-muted-foreground"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
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
