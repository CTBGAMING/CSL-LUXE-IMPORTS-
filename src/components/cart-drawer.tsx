import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatZAR } from "@/lib/format";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = "27710325294";

function buildWhatsAppUrl(items: ReturnType<typeof useCart>["items"], total: number) {
  const hasPreorder = items.some((i) => i.preorder);
  const lines = [
    "Hi CSL Luxe Imports! I'd like to place the following order:",
    "",
    ...items.map(
      (i) =>
        `• ${i.name} × ${i.quantity} — ${formatZAR(i.price * i.quantity)}${
          i.preorder
            ? ` (PRE-ORDER${i.preorder_eta ? `, arriving in ${i.preorder_eta}` : ""})`
            : ""
        }`,
    ),
    "",
    `Total: ${formatZAR(total)}`,
    ...(hasPreorder
      ? ["", "Some items are pre-orders and will ship once they arrive."]
      : []),
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function CartDrawer() {
  const { items, isOpen, setOpen, setQuantity, remove, total, clear } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card text-card-foreground shadow-2xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-2xl font-medium tracking-wide text-silver-gradient">
            Your Cart
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-serif text-2xl text-silver">Your cart is empty</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Browse the collection and add pieces you love.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 border-b border-border/60 pb-4"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded bg-muted">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <button
                        onClick={() => remove(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                          className="rounded border border-border p-1 text-muted-foreground hover:border-primary hover:text-primary"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                          className="rounded border border-border p-1 text-muted-foreground hover:border-primary hover:text-primary"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm text-silver">
                        {formatZAR(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border bg-background/60 px-6 py-5">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-sm uppercase tracking-widest text-muted-foreground">
                Total
              </span>
              <span className="font-serif text-3xl text-silver-gradient">
                {formatZAR(total)}
              </span>
            </div>
            <a
              href={buildWhatsAppUrl(items, total)}
              target="_top"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded bg-gradient-to-r from-primary to-purple-glow px-4 py-3 text-sm font-medium uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/30 transition hover:shadow-primary/50"
            >
              Checkout via WhatsApp
            </a>
            <p className="mt-3 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Opens WhatsApp chat with +27 71 032 5294
            </p>
            <Button
              variant="ghost"
              className="mt-2 w-full text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
              onClick={clear}
            >
              Clear cart
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
