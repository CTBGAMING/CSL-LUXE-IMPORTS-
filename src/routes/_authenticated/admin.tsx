import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, ShieldCheck, LayoutDashboard, Package, Boxes, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAdminProducts, fetchPurchaseOrders } from "@/lib/backoffice";
import { DashboardPanel } from "@/components/admin/dashboard-panel";
import { ProductsPanel } from "@/components/admin/products-panel";
import { InventoryPanel } from "@/components/admin/inventory-panel";
import { PurchasesPanel } from "@/components/admin/purchases-panel";
import logo from "@/assets/csl-luxe-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — CSL Luxe Imports" },
      { name: "description", content: "Manage the CSL Luxe Imports product catalog." },
      { property: "og:title", content: "Admin — CSL Luxe Imports" },
      { property: "og:description", content: "Product management dashboard." },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "purchases", label: "Purchases", icon: Receipt },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("overview");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setEmail(data.user.email ?? null);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
    })();
  }, []);

  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchAdminProducts,
    enabled: isAdmin === true,
  });

  const ordersQuery = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: fetchPurchaseOrders,
    enabled: isAdmin === true,
  });

  const products = productsQuery.data ?? [];
  const orders = ordersQuery.data ?? [];

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo.url} alt="CSL Luxe" className="h-9 w-9 object-contain" />
            <div>
              <p className="font-serif text-sm tracking-widest text-silver-gradient">
                CSL LUXE
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary/80">
                Back office
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {email && (
              <span className="hidden text-xs uppercase tracking-widest text-muted-foreground sm:inline">
                {email}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded border border-border px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        {isAdmin && (
          <div className="mx-auto hidden max-w-7xl gap-1 px-6 md:flex">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs uppercase tracking-widest transition ${
                  tab === t.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {!isAdmin ? (
          <div className="mx-auto max-w-lg rounded border border-border bg-card p-8 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-4 font-serif text-2xl text-silver-gradient">
              Admin access required
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account is signed in but doesn't have admin privileges. Ask an existing
              admin to grant you access.
            </p>
          </div>
        ) : tab === "overview" ? (
          <DashboardPanel products={products} orders={orders} />
        ) : tab === "products" ? (
          <ProductsPanel
            products={products}
            isLoading={productsQuery.isLoading}
            refetch={() => void productsQuery.refetch()}
          />
        ) : tab === "inventory" ? (
          <InventoryPanel
            products={products}
            orders={orders}
            refetch={() => void productsQuery.refetch()}
          />

        ) : (
          <PurchasesPanel
            orders={orders}
            products={products}
            isLoading={ordersQuery.isLoading}
            refetch={() => {
              void ordersQuery.refetch();
              void productsQuery.refetch();
            }}
          />
        )}
      </main>

      {isAdmin && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-lg md:hidden">
          <div className="grid grid-cols-4">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-widest transition ${
                  tab === t.id ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <t.icon className="h-5 w-5" />
                {t.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
