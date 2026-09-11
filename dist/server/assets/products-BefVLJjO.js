import { t as supabase } from "./client-XvGZhuVm.js";
//#region src/lib/format.ts
function formatZAR(amount) {
	return new Intl.NumberFormat("en-ZA", {
		style: "currency",
		currency: "ZAR",
		minimumFractionDigits: 2
	}).format(amount);
}
//#endregion
//#region src/lib/products.ts
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
export { isAvailable as a, fetchProducts as i, PREORDER_WINDOWS as n, formatZAR as o, fetchProduct as r, CATEGORIES as t };
