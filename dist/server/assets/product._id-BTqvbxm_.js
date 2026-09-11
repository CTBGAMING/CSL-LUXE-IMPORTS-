import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/routes/product.$id.tsx?tsr-split=notFoundComponent
var SplitNotFoundComponent = () => /* @__PURE__ */ jsx("div", {
	className: "flex min-h-screen items-center justify-center bg-background px-6 text-center",
	children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
		className: "font-serif text-3xl text-silver-gradient",
		children: "Piece not found"
	}), /* @__PURE__ */ jsx(Link, {
		to: "/",
		className: "mt-6 inline-block rounded-full border border-border px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-foreground hover:border-primary hover:text-primary",
		children: "Back to collection"
	})] })
});
//#endregion
export { SplitNotFoundComponent as notFoundComponent };
