import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import logo from "@/assets/csl-luxe-logo.png.asset.json";
import { CATEGORIES, type ProductCategory } from "@/lib/products";

export type NavFilter = ProductCategory | "All" | "Pre-order";

const FILTERS: NavFilter[] = ["All", ...CATEGORIES, "Pre-order"];

type Props = {
  activeCategory?: NavFilter;
  onCategoryChange?: (c: NavFilter) => void;
};

export function SiteNav({ activeCategory = "All", onCategoryChange }: Props) {
  const { count, setOpen } = useCart();
  const navigate = useNavigate();
  const handleCategory = (c: NavFilter) => {
    if (onCategoryChange) onCategoryChange(c);
    else navigate({ to: "/", hash: "collection" });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo.url} alt="CSL Luxe Imports" className="h-12 w-12 object-contain" />
          <div className="hidden sm:block">
            <p className="font-serif text-lg leading-none tracking-widest text-silver-gradient">
              CSL LUXE
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Imports
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`relative rounded px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] transition ${
                activeCategory === cat
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
              {activeCategory === cat && (
                <span className="absolute inset-x-4 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              )}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setOpen(true)}
          className="relative rounded-full border border-border p-2.5 text-foreground transition hover:border-primary hover:text-primary"
          aria-label={`Open cart (${count} items)`}
        >
          <ShoppingBag className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-glow px-1 text-[10px] font-semibold text-primary-foreground shadow-lg shadow-primary/40">
              {count}
            </span>
          )}
        </button>
      </div>

      {/* Mobile category chips */}
      <div className="flex gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 md:hidden">
        {FILTERS.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs uppercase tracking-widest transition ${
              activeCategory === cat
                ? "bg-primary/15 text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </header>
  );
}
