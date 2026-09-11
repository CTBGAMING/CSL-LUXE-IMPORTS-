import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { useCart } from "@/lib/cart";
import { fetchProduct, isAvailable } from "@/lib/products";
import { formatZAR } from "@/lib/format";

const productQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: async () => {
      const p = await fetchProduct(id);
      if (!p) throw notFound();
      return p;
    },
    staleTime: 60_000,
  });

export const Route = createFileRoute("/product/$id")({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(productQueryOptions(params.id)),
  head: ({ loaderData }) => {
    const title = loaderData
      ? `${loaderData.name} — CSL Luxe Imports`
      : "Product — CSL Luxe Imports";
    const description = loaderData?.description
      ? loaderData.description.slice(0, 160)
      : "Discover this signature piece from CSL Luxe Imports.";
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (loaderData?.signed_image_url?.startsWith("https://")) {
      meta.push({ property: "og:image", content: loaderData.signed_image_url });
      meta.push({ name: "twitter:image", content: loaderData.signed_image_url });
    }
    return { meta };
  },
  component: ProductDetail,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div>
        <p className="font-serif text-3xl text-silver-gradient">
          This piece is unavailable
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full border border-border px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-foreground hover:border-primary hover:text-primary"
        >
          Back to collection
        </Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div>
        <p className="font-serif text-3xl text-silver-gradient">Piece not found</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full border border-border px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-foreground hover:border-primary hover:text-primary"
        >
          Back to collection
        </Link>
      </div>
    </div>
  ),
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQueryOptions(id));
  const { add } = useCart();
  const gallery = product.signed_image_urls.length > 0
    ? product.signed_image_urls
    : product.signed_image_url
      ? [product.signed_image_url]
      : [];
  const [activeIdx, setActiveIdx] = useState(0);
  const activeImage = gallery[activeIdx] ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to collection
        </Link>

        <div className="mt-8 grid gap-12 md:grid-cols-2">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted ring-1 ring-border/40">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-serif text-6xl text-silver-gradient opacity-40">
                  CSL
                </div>
              )}
              <div className="absolute left-4 top-4">
                <span className="rounded-full bg-black/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-silver backdrop-blur-md">
                  {product.category}
                </span>
              </div>
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length)
                    }
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-silver backdrop-blur-md transition hover:bg-black/80 hover:text-primary"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIdx((i) => (i + 1) % gallery.length)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-silver backdrop-blur-md transition hover:bg-black/80 hover:text-primary"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-silver backdrop-blur-md">
                    {activeIdx + 1} / {gallery.length}
                  </div>
                </>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {gallery.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`relative aspect-square overflow-hidden rounded ring-1 transition ${
                      i === activeIdx
                        ? "ring-primary"
                        : "ring-border/40 hover:ring-primary/60"
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-[11px] uppercase tracking-[0.4em] text-primary/80">
              {product.category}
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-silver-gradient md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-6 font-serif text-3xl text-silver">
              {formatZAR(product.price)}
            </p>

            <div className="mt-8 h-px w-full bg-border/60" />

            <div className="mt-8">
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                Details
              </p>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-foreground/90">
                {product.description ??
                  "A signature piece from the CSL Luxe Imports collection, hand-picked for enduring elegance."}
              </p>
            </div>

            {product.preorder && (
              <div className="mt-8 rounded border border-primary/40 bg-primary/10 px-4 py-3 text-center text-[11px] uppercase tracking-[0.25em] text-primary">
                Pre-order ·{" "}
                {product.preorder_eta
                  ? `arriving in ${product.preorder_eta}`
                  : "arriving soon"}
              </div>
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
              className="mt-6 w-full rounded-full bg-gradient-to-r from-primary to-purple-glow py-4 text-[11px] font-medium uppercase tracking-[0.35em] text-primary-foreground shadow-lg shadow-primary/30 transition hover:shadow-primary/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {product.in_stock
                ? "Add to cart"
                : product.preorder
                  ? "Pre-order now"
                  : "Sold out"}
            </button>
            <p className="mt-4 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Checkout via WhatsApp · Ships nationwide from Cape Town
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
