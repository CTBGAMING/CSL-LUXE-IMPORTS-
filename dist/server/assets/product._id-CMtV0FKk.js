import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/routes/product.$id.tsx?tsr-split=errorComponent
var SplitErrorComponent = ({ error }) => /* @__PURE__ */ jsx("div", {
	className: "flex min-h-screen items-center justify-center bg-background px-6 text-center",
	children: /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("p", {
			className: "font-serif text-3xl text-silver-gradient",
			children: "This piece is unavailable"
		}),
		/* @__PURE__ */ jsx("p", {
			className: "mt-2 text-sm text-muted-foreground",
			children: error.message
		}),
		/* @__PURE__ */ jsx(Link, {
			to: "/",
			className: "mt-6 inline-block rounded-full border border-border px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-foreground hover:border-primary hover:text-primary",
			children: "Back to collection"
		})
	] })
});
//#endregion
export { SplitErrorComponent as errorComponent };
