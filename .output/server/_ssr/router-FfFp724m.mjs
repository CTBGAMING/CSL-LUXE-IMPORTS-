import { r as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { R as redirect, V as notFound, _ as createRootRouteWithContext, b as useRouter, d as HeadContent, g as createFileRoute, h as lazyRouteComponent, m as Outlet, p as createRouter, u as Scripts, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as QueryClientProvider, o as require_jsx_runtime, t as queryOptions } from "../_libs/react+tanstack__react-query.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as supabase } from "./client-XvGZhuVm.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { a as Trash2, p as Minus, t as X, u as Plus } from "../_libs/lucide-react.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/products-BefVLJjO.js
function formatZAR(amount) {
	return new Intl.NumberFormat("en-ZA", {
		style: "currency",
		currency: "ZAR",
		minimumFractionDigits: 2
	}).format(amount);
}
var CATEGORIES = [
	"925 Silver",
	"Stainless Steel",
	"Watches"
];
var PREORDER_WINDOWS = [
	"1-2 weeks",
	"2-3 weeks",
	"3-4 weeks",
	"4-6 weeks",
	"6-8 weeks"
];
/** Buyable when physically in stock, or offered as a pre-order. */
function isAvailable(p) {
	return p.in_stock || p.preorder;
}
async function signImagePaths(paths) {
	const urlMap = /* @__PURE__ */ new Map();
	if (paths.length === 0) return urlMap;
	const { data: signed } = await supabase.storage.from("product-images").createSignedUrls(paths, 3600);
	signed?.forEach((s) => {
		if (s.path && s.signedUrl) urlMap.set(s.path, s.signedUrl);
	});
	return urlMap;
}
function toSigned(row, urlMap) {
	const galleryPaths = [...row.image_url ? [row.image_url] : [], ...(row.images ?? []).filter((p) => p && p !== row.image_url)];
	return {
		...row,
		price: Number(row.price),
		images: row.images ?? [],
		signed_image_url: row.image_url ? urlMap.get(row.image_url) ?? null : null,
		signed_image_urls: galleryPaths.map((p) => urlMap.get(p)).filter((u) => !!u)
	};
}
async function fetchProducts() {
	const { data, error } = await supabase.from("products").select("id, name, description, price, category, image_url, images, in_stock, stock_qty, preorder, preorder_eta").order("created_at", { ascending: false });
	if (error) throw error;
	const rows = data ?? [];
	const paths = /* @__PURE__ */ new Set();
	rows.forEach((r) => {
		if (r.image_url) paths.add(r.image_url);
		(r.images ?? []).forEach((p) => p && paths.add(p));
	});
	const urlMap = await signImagePaths([...paths]);
	return rows.map((r) => toSigned(r, urlMap));
}
async function fetchProduct(id) {
	const { data, error } = await supabase.from("products").select("id, name, description, price, category, image_url, images, in_stock, stock_qty, preorder, preorder_eta").eq("id", id).maybeSingle();
	if (error) throw error;
	if (!data) return null;
	const row = data;
	const paths = /* @__PURE__ */ new Set();
	if (row.image_url) paths.add(row.image_url);
	(row.images ?? []).forEach((p) => p && paths.add(p));
	return toSigned(row, await signImagePaths([...paths]));
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-FfFp724m.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-DBmXHB85.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	window.__lovableReportRuntimeError?.({
		message,
		stack: error instanceof Error ? error.stack : void 0,
		filename: window.location.pathname
	});
}
var WHATSAPP_NUMBER$1 = "27710325294";
var DEFAULT_MESSAGE = "Hi CSL Luxe, I'd like to chat about your pieces.";
function WhatsAppFab() {
	const href = `https://wa.me/${WHATSAPP_NUMBER$1}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href,
		target: "_top",
		rel: "noopener noreferrer",
		"aria-label": "Chat to us on WhatsApp",
		className: "group fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-border/60 bg-gradient-to-br from-[#25D366] to-[#128C7E] px-4 py-3 text-sm font-medium text-white shadow-2xl shadow-black/40 transition hover:scale-105 hover:shadow-primary/40 sm:bottom-8 sm:right-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppIcon, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "hidden text-xs uppercase tracking-widest sm:inline",
			children: "Chat to us"
		})]
	});
}
function WhatsAppIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		width: "22",
		height: "22",
		viewBox: "0 0 32 32",
		fill: "currentColor",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M19.11 17.28c-.28-.14-1.66-.82-1.91-.91-.26-.09-.44-.14-.63.14-.18.28-.72.91-.88 1.1-.16.19-.32.21-.6.07-.28-.14-1.18-.44-2.25-1.39-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.19-.28.28-.46.09-.19.05-.35-.02-.49-.07-.14-.63-1.51-.86-2.07-.23-.54-.46-.47-.63-.48h-.54c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.34s1 2.71 1.14 2.9c.14.19 1.97 3.01 4.78 4.22.67.29 1.19.46 1.59.59.67.21 1.28.18 1.76.11.54-.08 1.66-.68 1.89-1.34.23-.66.23-1.22.16-1.34-.07-.12-.26-.19-.54-.33zM16.02 4C9.4 4 4.03 9.37 4.03 15.98c0 2.11.55 4.17 1.6 5.98L4 28l6.2-1.62a11.94 11.94 0 0 0 5.82 1.48h.01c6.62 0 11.99-5.37 11.99-11.98S22.64 4 16.02 4zm0 21.86h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.68.96.98-3.58-.24-.37a9.86 9.86 0 0 1-1.52-5.28c0-5.46 4.44-9.9 9.88-9.9 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.46-4.44 9.87-9.89 9.87z" })
	});
}
var CartContext = (0, import_react.createContext)(null);
var STORAGE_KEY = "csl-luxe-cart-v1";
function CartProvider({ children }) {
	const [items, setItems] = (0, import_react.useState)([]);
	const [isOpen, setOpen] = (0, import_react.useState)(false);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) setItems(JSON.parse(raw));
		} catch {}
		setHydrated(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	}, [items, hydrated]);
	const add = (0, import_react.useCallback)((item) => {
		setItems((prev) => {
			if (prev.find((p) => p.id === item.id)) return prev.map((p) => p.id === item.id ? {
				...p,
				quantity: p.quantity + 1
			} : p);
			return [...prev, {
				...item,
				quantity: 1
			}];
		});
		setOpen(true);
	}, []);
	const remove = (0, import_react.useCallback)((id) => {
		setItems((prev) => prev.filter((p) => p.id !== id));
	}, []);
	const setQuantity = (0, import_react.useCallback)((id, quantity) => {
		setItems((prev) => quantity <= 0 ? prev.filter((p) => p.id !== id) : prev.map((p) => p.id === id ? {
			...p,
			quantity
		} : p));
	}, []);
	const clear = (0, import_react.useCallback)(() => setItems([]), []);
	const value = (0, import_react.useMemo)(() => {
		const count = items.reduce((n, i) => n + i.quantity, 0);
		const total = items.reduce((n, i) => n + i.price * i.quantity, 0);
		return {
			items,
			count,
			total,
			add,
			remove,
			setQuantity,
			clear,
			isOpen,
			setOpen
		};
	}, [
		items,
		add,
		remove,
		setQuantity,
		clear,
		isOpen
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartContext.Provider, {
		value,
		children
	});
}
function useCart() {
	const ctx = (0, import_react.useContext)(CartContext);
	if (!ctx) throw new Error("useCart must be used inside CartProvider");
	return ctx;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var WHATSAPP_NUMBER = "27710325294";
function buildWhatsAppUrl(items, total) {
	const hasPreorder = items.some((i) => i.preorder);
	const lines = [
		"Hi CSL Luxe Imports! I'd like to place the following order:",
		"",
		...items.map((i) => `• ${i.name} × ${i.quantity} — ${formatZAR(i.price * i.quantity)}${i.preorder ? ` (PRE-ORDER${i.preorder_eta ? `, arriving in ${i.preorder_eta}` : ""})` : ""}`),
		"",
		`Total: ${formatZAR(total)}`,
		...hasPreorder ? ["", "Some items are pre-orders and will ship once they arrive."] : []
	];
	return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}
function CartDrawer() {
	const { items, isOpen, setOpen, setQuantity, remove, total, clear } = useCart();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`,
		onClick: () => setOpen(false),
		"aria-hidden": "true"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: `fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card text-card-foreground shadow-2xl transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`,
		"aria-label": "Shopping cart",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-border px-6 py-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-medium tracking-wide text-silver-gradient",
					children: "Your Cart"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setOpen(false),
					className: "rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground",
					"aria-label": "Close cart",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 overflow-y-auto px-6 py-4",
				children: items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-full flex-col items-center justify-center text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-serif text-2xl text-silver",
						children: "Your cart is empty"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "Browse the collection and add pieces you love."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-4",
					children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-4 border-b border-border/60 pb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-20 w-20 shrink-0 overflow-hidden rounded bg-muted",
							children: item.image_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: item.image_url,
								alt: item.name,
								className: "h-full w-full object-cover"
							}) : null
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-1 flex-col justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-foreground",
									children: item.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => remove(item.id),
									className: "text-muted-foreground hover:text-destructive",
									"aria-label": "Remove item",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setQuantity(item.id, item.quantity - 1),
											className: "rounded border border-border p-1 text-muted-foreground hover:border-primary hover:text-primary",
											"aria-label": "Decrease quantity",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-3 w-3" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-6 text-center text-sm tabular-nums",
											children: item.quantity
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setQuantity(item.id, item.quantity + 1),
											className: "rounded border border-border p-1 text-muted-foreground hover:border-primary hover:text-primary",
											"aria-label": "Increase quantity",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" })
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-silver",
									children: formatZAR(item.price * item.quantity)
								})]
							})]
						})]
					}, item.id))
				})
			}),
			items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border bg-background/60 px-6 py-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-baseline justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm uppercase tracking-widest text-muted-foreground",
							children: "Total"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-serif text-3xl text-silver-gradient",
							children: formatZAR(total)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: buildWhatsAppUrl(items, total),
						target: "_top",
						rel: "noopener noreferrer",
						className: "flex w-full items-center justify-center gap-2 rounded bg-gradient-to-r from-primary to-purple-glow px-4 py-3 text-sm font-medium uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/30 transition hover:shadow-primary/50",
						children: "Checkout via WhatsApp"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground",
						children: "Opens WhatsApp chat with +27 71 032 5294"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						className: "mt-2 w-full text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground",
						onClick: clear,
						children: "Clear cart"
					})
				]
			})
		]
	})] });
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$6 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{
				name: "author",
				content: "CSL Luxe Imports"
			},
			{ title: "CSL Luxe Imports — Timeless Elegance. Imported Excellence." },
			{
				property: "og:title",
				content: "CSL Luxe Imports — Timeless Elegance. Imported Excellence."
			},
			{
				name: "twitter:title",
				content: "CSL Luxe Imports — Timeless Elegance. Imported Excellence."
			},
			{
				name: "description",
				content: "Curated 925 sterling silver, stainless steel jewelry, and custom watches — hand-picked for those who wear their story."
			},
			{
				property: "og:description",
				content: "Curated 925 sterling silver, stainless steel jewelry, and custom watches — hand-picked for those who wear their story."
			},
			{
				name: "twitter:description",
				content: "Curated 925 sterling silver, stainless steel jewelry, and custom watches — hand-picked for those who wear their story."
			},
			{
				property: "og:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d2585df7-a523-45f3-af0d-7223c5c0b2a5/id-preview-e2c9c4e8--78051c28-965c-4012-bb8e-cc25c53e1a78.lovable.app-1784978778599.png"
			},
			{
				name: "twitter:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d2585df7-a523-45f3-af0d-7223c5c0b2a5/id-preview-e2c9c4e8--78051c28-965c-4012-bb8e-cc25c53e1a78.lovable.app-1784978778599.png"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				property: "og:type",
				content: "website"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$6.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CartProvider, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartDrawer, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppFab, {})
		] })
	});
}
var $$splitComponentImporter$4 = () => import("./routes-BULh2g-S.mjs");
var Route$5 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "CSL Luxe Imports — Timeless Elegance. Imported Excellence." },
		{
			name: "description",
			content: "Curated 925 sterling silver, stainless steel jewelry, and custom watches — hand-picked for those who wear their story."
		},
		{
			property: "og:title",
			content: "CSL Luxe Imports — Timeless Elegance. Imported Excellence."
		},
		{
			property: "og:description",
			content: "Curated 925 sterling silver, stainless steel jewelry, and custom watches — hand-picked for those who wear their story."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./route-Di7iQBCH.mjs");
var Route$4 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./auth-CAhIGaj0.mjs");
var Route$3 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "Admin Sign In — CSL Luxe Imports" },
		{
			name: "description",
			content: "Sign in to the CSL Luxe Imports admin dashboard."
		},
		{
			property: "og:title",
			content: "Admin Sign In — CSL Luxe Imports"
		},
		{
			property: "og:description",
			content: "Admin access for CSL Luxe Imports."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "robots",
			content: "noindex,nofollow"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./admin-CMqSBqiK.mjs");
var Route$2 = createFileRoute("/_authenticated/admin")({
	head: () => ({ meta: [
		{ title: "Admin — CSL Luxe Imports" },
		{
			name: "description",
			content: "Manage the CSL Luxe Imports product catalog."
		},
		{
			property: "og:title",
			content: "Admin — CSL Luxe Imports"
		},
		{
			property: "og:description",
			content: "Product management dashboard."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var BASE_RULES = "Professional product photography retouching for a South African jewellery/watch store. Keep the exact item unchanged: shape, proportions, engravings, stones, links, dial, hands, text and brand marks must stay identical. Only adjust lighting, background, colour balance, sharpness and framing. Never add or remove parts of the product.";
function dataUrlToBlob(dataUrl) {
	const match = dataUrl.match(/^data:([a-zA-Z0-9.+-]+);base64,(.+)$/);
	if (!match) throw new Error("Invalid image data.");
	const mime = match[1];
	const byteChars = atob(match[2]);
	const byteNumbers = new Array(byteChars.length);
	for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
	const bytes = new Uint8Array(byteNumbers);
	return new Blob([bytes], { type: mime });
}
var Route$1 = createFileRoute("/api/enhance-image")({ server: { handlers: { POST: async ({ request }) => {
	const authHeader = request.headers.get("authorization") ?? "";
	if (!authHeader.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });
	const token = authHeader.slice(7);
	const SUPABASE_URL = process.env["SUPABASE_URL"];
	const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
	const key = process.env["OPENAI_API_KEY"];
	if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return new Response("Backend is not configured.", { status: 500 });
	if (!key) return new Response("OpenAI key is not configured.", { status: 500 });
	const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
		global: { fetch: (input, init) => {
			const headers = new Headers(init?.headers);
			if (headers.get("Authorization") === `Bearer ${SUPABASE_PUBLISHABLE_KEY}`) headers.delete("Authorization");
			headers.set("apikey", SUPABASE_PUBLISHABLE_KEY);
			headers.set("Authorization", `Bearer ${token}`);
			return fetch(input, {
				...init,
				headers
			});
		} },
		auth: {
			persistSession: false,
			autoRefreshToken: false
		}
	});
	const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
	const userId = claims?.claims?.sub;
	if (claimsError || !userId) return new Response("Unauthorized", { status: 401 });
	const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
	if (!roles?.some((r) => r.role === "admin")) return new Response("Admin access required", { status: 403 });
	const body = await request.json();
	const dataUrl = body.dataUrl ?? "";
	const instruction = (body.instruction ?? "").slice(0, 1e3);
	if (!/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(dataUrl)) return new Response("That file isn't a readable image — try a JPG or PNG.", { status: 400 });
	let imageBlob;
	try {
		imageBlob = dataUrlToBlob(dataUrl);
	} catch {
		return new Response("Could not read that image.", { status: 400 });
	}
	const form = new FormData();
	form.append("model", "gpt-image-1");
	form.append("image", imageBlob, "source.jpg");
	form.append("prompt", `${BASE_RULES}\n\nRetouch instruction: ${instruction}`);
	form.append("stream", "true");
	form.append("partial_images", "1");
	const upstream = await fetch("https://api.openai.com/v1/images/edits", {
		method: "POST",
		headers: { Authorization: `Bearer ${key}` },
		body: form
	});
	if (!upstream.ok || !upstream.body) {
		const detail = await upstream.text().catch(() => "");
		let errorText = "Enhance failed — try again with a smaller image.";
		try {
			const parsed = JSON.parse(detail);
			const code = parsed.error?.code ?? "";
			const message = parsed.error?.message ?? "";
			if (upstream.status === 401 || code === "invalid_api_key") errorText = "OpenAI key is invalid — check the key in settings.";
			else if (code === "insufficient_quota") errorText = "OpenAI account is out of credits — add more at platform.openai.com.";
			else if (upstream.status === 429 || code === "rate_limit_exceeded") errorText = "OpenAI is busy — wait a moment and try again.";
			else if (message) errorText = message;
		} catch {
			if (upstream.status === 401) errorText = "OpenAI key is invalid.";
			if (upstream.status === 429) errorText = "OpenAI is busy — wait a moment and try again.";
		}
		console.error("enhance-image failed", upstream.status, detail.slice(0, 500));
		return new Response(errorText, { status: upstream.status });
	}
	return new Response(upstream.body, { headers: {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache"
	} });
} } } });
var productQueryOptions = (id) => queryOptions({
	queryKey: ["product", id],
	queryFn: async () => {
		const p = await fetchProduct(id);
		if (!p) throw notFound();
		return p;
	},
	staleTime: 6e4
});
var $$splitNotFoundComponentImporter = () => import("./product._id-BTqvbxm_.mjs");
var $$splitErrorComponentImporter = () => import("./product._id-CMtV0FKk.mjs");
var $$splitComponentImporter = () => import("./product._id-D8t-U-cF.mjs");
var Route = createFileRoute("/product/$id")({
	loader: ({ params, context }) => context.queryClient.ensureQueryData(productQueryOptions(params.id)),
	head: ({ loaderData }) => {
		const title = loaderData ? `${loaderData.name} — CSL Luxe Imports` : "Product — CSL Luxe Imports";
		const description = loaderData?.description ? loaderData.description.slice(0, 160) : "Discover this signature piece from CSL Luxe Imports.";
		const meta = [
			{ title },
			{
				name: "description",
				content: description
			},
			{
				property: "og:title",
				content: title
			},
			{
				property: "og:description",
				content: description
			},
			{
				property: "og:type",
				content: "product"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		];
		if (loaderData?.signed_image_url?.startsWith("https://")) {
			meta.push({
				property: "og:image",
				content: loaderData.signed_image_url
			});
			meta.push({
				name: "twitter:image",
				content: loaderData.signed_image_url
			});
		}
		return { meta };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
var IndexRoute = Route$5.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$6
});
var AuthenticatedRouteRoute = Route$4.update({
	id: "/_authenticated",
	getParentRoute: () => Route$6
});
var AuthRoute = Route$3.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$6
});
var AuthenticatedAdminRoute = Route$2.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => AuthenticatedRouteRoute
});
var ApiEnhanceImageRoute = Route$1.update({
	id: "/api/enhance-image",
	path: "/api/enhance-image",
	getParentRoute: () => Route$6
});
var ProductIdRoute = Route.update({
	id: "/product/$id",
	path: "/product/$id",
	getParentRoute: () => Route$6
});
var AuthenticatedRouteRouteChildren = { AuthenticatedAdminRoute };
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute,
	ApiEnhanceImageRoute,
	ProductIdRoute
};
var routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { CATEGORIES as a, formatZAR as c, useCart as i, isAvailable as l, Route as n, PREORDER_WINDOWS as o, productQueryOptions as r, fetchProducts as s, router_exports as t };
