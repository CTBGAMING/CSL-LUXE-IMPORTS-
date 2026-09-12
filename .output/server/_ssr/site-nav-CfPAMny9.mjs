import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as csl_luxe_logo_default } from "./csl-luxe-logo-Dg7BTdpi.mjs";
import { s as ShoppingBag } from "../_libs/lucide-react.mjs";
import { a as CATEGORIES, i as useCart } from "./router-uYa5hawx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/site-nav-CfPAMny9.js
var import_jsx_runtime = require_jsx_runtime();
var FILTERS = [
	"All",
	...CATEGORIES,
	"Pre-order"
];
function SiteNav({ activeCategory = "All", onCategoryChange }) {
	const { count, setOpen } = useCart();
	const navigate = useNavigate();
	const handleCategory = (c) => {
		if (onCategoryChange) onCategoryChange(c);
		else navigate({
			to: "/",
			hash: "collection"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-lg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: csl_luxe_logo_default.url,
						alt: "CSL Luxe Imports",
						className: "h-12 w-12 object-contain"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden sm:block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-serif text-lg leading-none tracking-widest text-silver-gradient",
							children: "CSL LUXE"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground",
							children: "Imports"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "hidden items-center gap-1 md:flex",
					children: FILTERS.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => handleCategory(cat),
						className: `relative rounded px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] transition ${activeCategory === cat ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`,
						children: [cat, activeCategory === cat && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-x-4 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-primary to-transparent" })]
					}, cat))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setOpen(true),
					className: "relative rounded-full border border-border p-2.5 text-foreground transition hover:border-primary hover:text-primary",
					"aria-label": `Open cart (${count} items)`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-5 w-5" }), count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-glow px-1 text-[10px] font-semibold text-primary-foreground shadow-lg shadow-primary/40",
						children: count
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 md:hidden",
			children: FILTERS.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => handleCategory(cat),
				className: `whitespace-nowrap rounded-full px-3 py-1.5 text-xs uppercase tracking-widest transition ${activeCategory === cat ? "bg-primary/15 text-foreground" : "text-muted-foreground"}`,
				children: cat
			}, cat))
		})]
	});
}
//#endregion
export { SiteNav as t };
