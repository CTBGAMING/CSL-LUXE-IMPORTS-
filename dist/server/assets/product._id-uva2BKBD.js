import { a as isAvailable, o as formatZAR } from "./products-BefVLJjO.js";
import { i as useCart, n as Route, r as productQueryOptions } from "./router-Dfthusd6.js";
import { t as SiteNav } from "./site-nav-BuQZm8z3.js";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
//#region src/routes/product.$id.tsx?tsr-split=component
function ProductDetail() {
	const { id } = Route.useParams();
	const { data: product } = useSuspenseQuery(productQueryOptions(id));
	const { add } = useCart();
	const gallery = product.signed_image_urls.length > 0 ? product.signed_image_urls : product.signed_image_url ? [product.signed_image_url] : [];
	const [activeIdx, setActiveIdx] = useState(0);
	const activeImage = gallery[activeIdx] ?? null;
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [/* @__PURE__ */ jsx(SiteNav, {}), /* @__PURE__ */ jsxs("main", {
			className: "mx-auto max-w-6xl px-6 py-12",
			children: [/* @__PURE__ */ jsxs(Link, {
				to: "/",
				className: "inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground transition hover:text-foreground",
				children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "h-3.5 w-3.5" }), "Back to collection"]
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-8 grid gap-12 md:grid-cols-2",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "relative aspect-[4/5] overflow-hidden rounded-lg bg-muted ring-1 ring-border/40",
					children: [
						activeImage ? /* @__PURE__ */ jsx("img", {
							src: activeImage,
							alt: product.name,
							className: "h-full w-full object-cover"
						}) : /* @__PURE__ */ jsx("div", {
							className: "flex h-full w-full items-center justify-center font-serif text-6xl text-silver-gradient opacity-40",
							children: "CSL"
						}),
						/* @__PURE__ */ jsx("div", {
							className: "absolute left-4 top-4",
							children: /* @__PURE__ */ jsx("span", {
								className: "rounded-full bg-black/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-silver backdrop-blur-md",
								children: product.category
							})
						}),
						gallery.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length),
								"aria-label": "Previous image",
								className: "absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-silver backdrop-blur-md transition hover:bg-black/80 hover:text-primary",
								children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setActiveIdx((i) => (i + 1) % gallery.length),
								"aria-label": "Next image",
								className: "absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-silver backdrop-blur-md transition hover:bg-black/80 hover:text-primary",
								children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-silver backdrop-blur-md",
								children: [
									activeIdx + 1,
									" / ",
									gallery.length
								]
							})
						] })
					]
				}), gallery.length > 1 && /* @__PURE__ */ jsx("div", {
					className: "mt-4 grid grid-cols-5 gap-2",
					children: gallery.map((url, i) => /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setActiveIdx(i),
						"aria-label": `View image ${i + 1}`,
						className: `relative aspect-square overflow-hidden rounded ring-1 transition ${i === activeIdx ? "ring-primary" : "ring-border/40 hover:ring-primary/60"}`,
						children: /* @__PURE__ */ jsx("img", {
							src: url,
							alt: "",
							className: "h-full w-full object-cover"
						})
					}, url))
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "text-[11px] uppercase tracking-[0.4em] text-primary/80",
							children: product.category
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "mt-3 font-serif text-4xl leading-tight text-silver-gradient md:text-5xl",
							children: product.name
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-6 font-serif text-3xl text-silver",
							children: formatZAR(product.price)
						}),
						/* @__PURE__ */ jsx("div", { className: "mt-8 h-px w-full bg-border/60" }),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-8",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-[11px] uppercase tracking-[0.3em] text-muted-foreground",
								children: "Details"
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-3 whitespace-pre-line text-base leading-relaxed text-foreground/90",
								children: product.description ?? "A signature piece from the CSL Luxe Imports collection, hand-picked for enduring elegance."
							})]
						}),
						product.preorder && /* @__PURE__ */ jsxs("div", {
							className: "mt-8 rounded border border-primary/40 bg-primary/10 px-4 py-3 text-center text-[11px] uppercase tracking-[0.25em] text-primary",
							children: [
								"Pre-order ·",
								" ",
								product.preorder_eta ? `arriving in ${product.preorder_eta}` : "arriving soon"
							]
						}),
						/* @__PURE__ */ jsx("button", {
							onClick: () => add({
								id: product.id,
								name: product.name,
								price: product.price,
								image_url: product.signed_image_url,
								preorder: !product.in_stock && product.preorder,
								preorder_eta: product.preorder_eta
							}),
							disabled: !isAvailable(product),
							className: "mt-6 w-full rounded-full bg-gradient-to-r from-primary to-purple-glow py-4 text-[11px] font-medium uppercase tracking-[0.35em] text-primary-foreground shadow-lg shadow-primary/30 transition hover:shadow-primary/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
							children: product.in_stock ? "Add to cart" : product.preorder ? "Pre-order now" : "Sold out"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-4 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground",
							children: "Checkout via WhatsApp · Ships nationwide from Cape Town"
						})
					]
				})]
			})]
		})]
	});
}
//#endregion
export { ProductDetail as component };
