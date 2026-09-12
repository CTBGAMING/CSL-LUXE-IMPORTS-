import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime, r as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { c as formatZAR, i as useCart, l as isAvailable, s as fetchProducts } from "./router-uYa5hawx.mjs";
import { t as SiteNav } from "./site-nav-CfPAMny9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-78dMGXMU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var hero_default = "/assets/hero-Dj8xsjft.jpg";
function Storefront() {
	const [category, setCategory] = (0, import_react.useState)("All");
	const { data, isLoading, error } = useQuery({
		queryKey: ["products"],
		queryFn: fetchProducts,
		staleTime: 6e4
	});
	const all = data ?? [];
	const preorderCount = all.filter((p) => p.preorder).length;
	const products = all.filter((p) => category === "All" ? true : category === "Pre-order" ? p.preorder : p.category === category);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {
				activeCategory: category,
				onCategoryChange: setCategory
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative overflow-hidden border-b border-border/60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: hero_default,
							alt: "",
							className: "h-full w-full object-cover object-center opacity-70"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/60" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-6 py-24 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-[0.5em] text-purple-gradient",
							children: "Timeless Elegance · Imported Excellence"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-6 font-serif text-6xl leading-[1.05] text-silver-gradient md:text-7xl lg:text-8xl",
							children: "CSL Luxe Imports"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg",
							children: "Curated 925 sterling silver, stainless steel jewelry, and custom watches — hand-picked for those who wear their story."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "#collection",
							className: "mt-10 inline-flex items-center gap-3 rounded-full border border-border/70 bg-background/40 px-6 py-3 text-[11px] uppercase tracking-[0.35em] text-foreground backdrop-blur transition hover:border-primary hover:text-primary",
							children: ["Explore the collection", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": true,
								children: "→"
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-b border-border/60 bg-gradient-to-r from-primary/10 via-background to-primary/10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-7xl items-center justify-center gap-3 px-6 py-3 text-center text-[11px] uppercase tracking-[0.35em] text-silver",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							className: "text-primary",
							children: "✦"
						}),
						"Nationwide delivery across South Africa",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							className: "text-primary",
							children: "✦"
						})
					]
				})
			}),
			category === "All" && preorderCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "preorder",
				className: "border-b border-border/60 bg-gradient-to-b from-primary/5 to-background",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-6 py-16",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-10 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-[0.4em] text-primary/80",
								children: "Pre-order"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 font-serif text-4xl text-silver-gradient md:text-5xl",
								children: "Arriving Soon"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 max-w-xl text-sm text-muted-foreground",
								children: "On their way to us — reserve yours now and we'll ship the moment they land."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setCategory("Pre-order"),
							className: "text-[11px] uppercase tracking-[0.3em] text-muted-foreground transition hover:text-primary",
							children: [
								"View all ",
								preorderCount,
								" →"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3",
						children: all.filter((p) => p.preorder).slice(0, 3).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: p }, p.id))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				id: "collection",
				className: "mx-auto max-w-7xl px-6 py-20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-14 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-[0.4em] text-primary/80",
							children: category === "All" ? "The Collection" : category
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-3 font-serif text-4xl text-silver-gradient md:text-5xl",
							children: category === "Pre-order" ? "Arriving Soon" : "Signature Pieces"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] uppercase tracking-[0.3em] text-muted-foreground",
							children: [
								products.length,
								" ",
								products.length === 1 ? "piece" : "pieces"
							]
						})]
					}),
					isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3",
						children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "animate-pulse",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-[4/5] rounded-lg bg-muted" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-4 w-3/4 rounded bg-muted" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-2 h-4 w-1/3 rounded bg-muted" })
							]
						}, i))
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive-foreground",
						children: "Could not load products. Please refresh in a moment."
					}),
					!isLoading && !error && products.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-24 text-center text-muted-foreground",
						children: "No pieces in this category yet."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3",
						children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: p }, p.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "mt-16 border-t border-border/60 bg-background/80",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-7xl flex-col items-center gap-2 px-6 py-10 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-silver",
						children: "CSL Luxe Imports"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"© ",
						(/* @__PURE__ */ new Date()).getFullYear(),
						" — Timeless Elegance, Imported Excellence."
					] })]
				})
			})
		]
	});
}
function ProductCard({ product }) {
	const { add } = useCart();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "group flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/product/$id",
				params: { id: product.id },
				className: "relative aspect-[4/5] overflow-hidden rounded-lg bg-muted ring-1 ring-border/40 transition duration-500 group-hover:ring-primary/40",
				"aria-label": `View ${product.name}`,
				children: [
					product.signed_image_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: product.signed_image_url,
						alt: product.name,
						loading: "lazy",
						className: "h-full w-full object-cover transition duration-[900ms] ease-out group-hover:scale-[1.04]"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-full w-full items-center justify-center font-serif text-4xl text-silver-gradient opacity-40",
						children: "CSL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute left-4 top-4 flex flex-col items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-black/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-silver backdrop-blur-md",
							children: product.category
						}), product.preorder && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-primary/85 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-primary-foreground backdrop-blur-md",
							children: "Pre-order"
						})]
					}),
					product.preorder ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-x-0 bottom-0 bg-black/70 px-3 py-2 text-center text-[10px] uppercase tracking-widest text-silver",
						children: product.preorder_eta ? `Arriving in ${product.preorder_eta}` : "Arriving soon"
					}) : !product.in_stock && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-x-0 bottom-0 bg-black/70 px-3 py-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground",
						children: "Sold out"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex items-baseline justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/product/$id",
					params: { id: product.id },
					className: "min-w-0 truncate font-serif text-xl text-foreground transition hover:text-primary",
					children: product.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "shrink-0 font-serif text-lg text-silver",
					children: formatZAR(product.price)
				})]
			}),
			product.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground",
				children: product.description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => add({
					id: product.id,
					name: product.name,
					price: product.price,
					image_url: product.signed_image_url,
					preorder: !product.in_stock && product.preorder,
					preorder_eta: product.preorder_eta
				}),
				disabled: !isAvailable(product),
				className: "mt-5 w-full rounded-full border border-border/70 py-3 text-[11px] font-medium uppercase tracking-[0.3em] text-foreground transition hover:border-primary hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent disabled:hover:text-foreground",
				children: product.in_stock ? "Add to cart" : product.preorder ? "Pre-order now" : "Unavailable"
			})
		]
	});
}
//#endregion
export { Storefront as component };
