import { useMemo } from "react";
import { Boxes, Coins, TrendingUp, AlertTriangle, Receipt } from "lucide-react";
import { formatZAR } from "@/lib/format";
import { orderTotal, type AdminProduct, type PurchaseOrder } from "@/lib/backoffice";

type Props = {
  products: AdminProduct[];
  orders: PurchaseOrder[];
};

export function DashboardPanel({ products, orders }: Props) {
  const stats = useMemo(() => {
    const units = products.reduce((s, p) => s + p.stock_qty, 0);
    const costValue = products.reduce((s, p) => s + p.stock_qty * p.cost_price, 0);
    const retailValue = products.reduce((s, p) => s + p.stock_qty * p.price, 0);
    const spend = orders
      .filter((o) => o.status !== "draft")
      .reduce((s, o) => s + orderTotal(o), 0);
    const lowStock = products.filter((p) => p.stock_qty > 0 && p.stock_qty <= 2);
    const outOfStock = products.filter((p) => p.stock_qty === 0);
    return { units, costValue, retailValue, spend, lowStock, outOfStock };
  }, [products, orders]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl text-silver-gradient">Back office</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Live inventory value, spend and expected profit.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon={<Boxes className="h-4 w-4" />}
          label="Units in stock"
          value={String(stats.units)}
        />
        <Stat
          icon={<Coins className="h-4 w-4" />}
          label="Stock at cost"
          value={formatZAR(stats.costValue)}
        />
        <Stat
          icon={<TrendingUp className="h-4 w-4" />}
          label="Expected profit"
          value={formatZAR(stats.retailValue - stats.costValue)}
          hint={`Retail value ${formatZAR(stats.retailValue)}`}
          accent
        />
        <Stat
          icon={<Receipt className="h-4 w-4" />}
          label="Purchase spend"
          value={formatZAR(stats.spend)}
          hint={`${orders.length} order${orders.length === 1 ? "" : "s"}`}
        />
      </div>

      {(stats.lowStock.length > 0 || stats.outOfStock.length > 0) && (
        <div className="rounded border border-border bg-card p-4">
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
            <AlertTriangle className="h-4 w-4" /> Needs restocking
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {[...stats.outOfStock, ...stats.lowStock].map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3">
                <span className="truncate text-foreground">{p.name}</span>
                <span
                  className={
                    p.stock_qty === 0 ? "text-destructive" : "text-muted-foreground"
                  }
                >
                  {p.stock_qty === 0 ? "Sold out" : `${p.stock_qty} left`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded border p-4 ${
        accent
          ? "border-primary/40 bg-gradient-to-br from-primary/10 to-transparent"
          : "border-border bg-card"
      }`}
    >
      <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {icon} {label}
      </p>
      <p className="mt-2 font-serif text-2xl text-silver-gradient">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
