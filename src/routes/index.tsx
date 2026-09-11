import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteNav, type NavFilter } from "@/components/site-nav";
import { useCart } from "@/lib/cart";
import { fetchProducts, isAvailable, type ProductWithSignedUrl } from "@/lib/products";
import { formatZAR } from "@/lib/format";
import heroAsset from "@/assets/hero.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CSL Luxe Imports — Timeless Elegance. Imported Excellence." },
      {
        name: "description",
        content:
          "Curated 925 sterling silver, stainless steel jewelry, and custom watches — hand-picked for those who wear their story.",
      },
      { property: "og:title", content: "CSL Luxe Imports — Timeless Elegance. Imported Excellence." },
      {
        property: "og:description",
        content:
          "Curated 925 sterling silver, stainless steel jewelry, and custom watches — hand-picked for those who wear their story.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Storefront,
});

function Storefront() {
  const [category, setCategory] = useState<NavFilter>("All");
  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 60_000,
  });

  const all = data ?? [];
  const preorderCount = all.filter((p) => p.preorder).length;
  const products = all.filter((p) =>
    category === "All"
      ? true
      : category === "Pre-order"
        ? p.preorder
        : p.category === category,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav activeCategory={category} onCategoryChange={setCategory} />

      {/* Editorial hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0">
          <img
            src={heroAsset.url}
            alt=""
            className="h-full w-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/60" />
        </div>
        <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-6 py-24 text-center">
          <p className="text-[11px] uppercase tracking-[0.5em] text-purple-gradient">
            Timeless Elegance · Imported Excellence
          </p>
          <h1 className="mt-6 font-serif text-6xl leading-[1.05] text-silver-gradient md:text-7xl lg:text-8xl">
            CSL Luxe Imports
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Curated 925 sterling silver, stainless steel jewelry, and custom watches —
            hand-picked for those who wear their story.
          </p>
          <a
            href="#collection"
            className="mt-10 inline-flex items-center gap-3 rounded-full border border-border/70 bg-background/40 px-6 py-3 text-[11px] uppercase tracking-[0.35em] text-foreground backdrop-blur transition hover:border-primary hover:text-primary"
          >
            Explore the collection
            <span aria-hidden>→</span>
          </a>
        </div>
      </section>

      {/* Nationwide delivery notice */}
      <div className="border-b border-border/60 bg-gradient-to-r from-primary/10 via-background to-primary/10">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-6 py-3 text-center text-[11px] uppercase tracking-[0.35em] text-silver">
          <span aria-hidden className="text-primary">✦</span>
          Nationwide delivery across South Africa
          <span aria-hidden className="text-primary">✦</span>
        </div>
      </div>

      {/* Pre-order section */}
      {category === "All" && preorderCount > 0 && (
        <section
          id="preorder"
          className="border-b border-border/60 bg-gradient-to-b from-primary/5 to-background"
        >
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-10 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-primary/80">
                  Pre-order
                </p>
                <h2 className="mt-3 font-serif text-4xl text-silver-gradient md:text-5xl">
                  Arriving Soon
                </h2>
                <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                  On their way to us — reserve yours now and we'll ship the moment they land.
                </p>
              </div>
              <button
                onClick={() => setCategory("Pre-order")}
                className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground transition hover:text-primary"
              >
                View all {preorderCount} →
              </button>
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {all
                .filter((p) => p.preorder)
                .slice(0, 3)
                .map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
            </div>
          </div>
        </section>
      )}

      <main id="collection" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-14 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-primary/80">
              {category === "All" ? "The Collection" : category}
            </p>
            <h2 className="mt-3 font-serif text-4xl text-silver-gradient md:text-5xl">
              {category === "Pre-order" ? "Arriving Soon" : "Signature Pieces"}
            </h2>
          </div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] rounded-lg bg-muted" />
                <div className="mt-4 h-4 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-4 w-1/3 rounded bg-muted" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="rounded border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive-foreground">
            Could not load products. Please refresh in a moment.
          </p>
        )}

        {!isLoading && !error && products.length === 0 && (
          <p className="py-24 text-center text-muted-foreground">
            No pieces in this category yet.
          </p>
        )}

        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </main>

      <footer className="mt-16 border-t border-border/60 bg-background/80">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-6 py-10 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <p className="text-silver">CSL Luxe Imports</p>
          <p>© {new Date().getFullYear()} — Timeless Elegance, Imported Excellence.</p>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ product }: { product: ProductWithSignedUrl }) {
  const { add } = useCart();
  return (
    <article className="group flex flex-col">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted ring-1 ring-border/40 transition duration-500 group-hover:ring-primary/40"
        aria-label={`View ${product.name}`}
      >
        {product.signed_image_url ? (
          <img
            src={product.signed_image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-serif text-4xl text-silver-gradient opacity-40">
            CSL
          </div>
        )}

        {/* Category badge overlay */}
        <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
          <span className="rounded-full bg-black/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-silver backdrop-blur-md">
            {product.category}
          </span>
          {product.preorder && (
            <span className="rounded-full bg-primary/85 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-primary-foreground backdrop-blur-md">
              Pre-order
            </span>
          )}
        </div>

        {product.preorder ? (
          <div className="absolute inset-x-0 bottom-0 bg-black/70 px-3 py-2 text-center text-[10px] uppercase tracking-widest text-silver">
            {product.preorder_eta
              ? `Arriving in ${product.preorder_eta}`
              : "Arriving soon"}
          </div>
        ) : (
          !product.in_stock && (
            <div className="absolute inset-x-0 bottom-0 bg-black/70 px-3 py-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
              Sold out
            </div>
          )
        )}

        {/* Subtle gradient wash on hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      </Link>

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="min-w-0 truncate font-serif text-xl text-foreground transition hover:text-primary"
        >
          {product.name}
        </Link>
        <p className="shrink-0 font-serif text-lg text-silver">
          {formatZAR(product.price)}
        </p>
      </div>
      {product.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
      )}
      <button
        onClick={() =>
          add({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.signed_image_url,
            preorder: !product.in_stock && product.preorder,
            preorder_eta: product.preorder_eta,
          })
        }
        disabled={!isAvailable(product)}
        className="mt-5 w-full rounded-full border border-border/70 py-3 text-[11px] font-medium uppercase tracking-[0.3em] text-foreground transition hover:border-primary hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent disabled:hover:text-foreground"
      >
        {product.in_stock
          ? "Add to cart"
          : product.preorder
            ? "Pre-order now"
            : "Unavailable"}
      </button>
    </article>
  );
}
