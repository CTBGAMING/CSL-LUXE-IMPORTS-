import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { I as isRedirect, b as useRouter, l as require_react_dom, v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as useQueryClient, o as require_jsx_runtime, r as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./server-CJcie1Pg.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-CgDK2GLf.mjs";
import { t as supabase } from "./client-XvGZhuVm.mjs";
import { t as csl_luxe_logo_default } from "./csl-luxe-logo-Dg7BTdpi.mjs";
import { i as string, r as object } from "../_libs/zod.mjs";
import { _ as Coins, a as Trash2, b as Check, c as ShieldCheck, d as Pencil, f as Package, g as LayoutDashboard, h as LoaderCircle, i as TrendingUp, l as Receipt, m as LogOut, n as Truck, o as Sparkles, p as Minus, r as TriangleAlert, t as X, u as Plus, x as Boxes } from "../_libs/lucide-react.mjs";
import { t as createParser } from "../_libs/eventsource-parser.mjs";
import { a as CATEGORIES, c as formatZAR, o as PREORDER_WINDOWS, s as fetchProducts } from "./router-FfFp724m.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-CMqSBqiK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = require_react_dom();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
async function fetchAdminProducts() {
	const [products, costs] = await Promise.all([fetchProducts(), supabase.from("product_costs").select("product_id, cost_price")]);
	const costMap = /* @__PURE__ */ new Map();
	(costs.data ?? []).forEach((c) => costMap.set(c.product_id, Number(c.cost_price)));
	return products.map((p) => ({
		...p,
		cost_price: costMap.get(p.id) ?? 0,
		stock_qty: p.stock_qty ?? 0
	}));
}
async function saveProductCost(productId, cost) {
	const { error } = await supabase.from("product_costs").upsert({
		product_id: productId,
		cost_price: cost
	}, { onConflict: "product_id" });
	if (error) throw error;
}
async function saveStockQty(productId, qty) {
	const { error } = await supabase.from("products").update({
		stock_qty: qty,
		in_stock: qty > 0
	}).eq("id", productId);
	if (error) throw error;
}
/** Mark a product as sellable on pre-order (with a rough arrival window). */
async function setPreorder(productId, preorder, eta) {
	const { error } = await supabase.from("products").update({
		preorder,
		preorder_eta: preorder ? eta : null
	}).eq("id", productId);
	if (error) throw error;
}
async function fetchPurchaseOrders() {
	const { data, error } = await supabase.from("purchase_orders").select("id, supplier, reference, order_date, status, notes, receipt_image, shipping_cost, created_at, purchase_order_items(id, product_id, description, quantity, unit_cost)").order("order_date", { ascending: false });
	if (error) throw error;
	return (data ?? []).map((row) => ({
		id: row.id,
		supplier: row.supplier,
		reference: row.reference,
		order_date: row.order_date,
		status: row.status,
		notes: row.notes,
		receipt_image: row.receipt_image,
		shipping_cost: Number(row.shipping_cost),
		created_at: row.created_at,
		items: (row.purchase_order_items ?? []).map((i) => ({
			id: i.id,
			product_id: i.product_id,
			description: i.description,
			quantity: i.quantity,
			unit_cost: Number(i.unit_cost)
		}))
	}));
}
function orderTotal(po) {
	return po.items.reduce((sum, i) => sum + i.quantity * i.unit_cost, 0) + (po.shipping_cost || 0);
}
async function savePurchaseOrder(po, items) {
	const payload = {
		supplier: po.supplier,
		reference: po.reference,
		order_date: po.order_date,
		status: po.status,
		notes: po.notes,
		receipt_image: po.receipt_image,
		shipping_cost: po.shipping_cost
	};
	let orderId = po.id;
	if (orderId) {
		const { error } = await supabase.from("purchase_orders").update(payload).eq("id", orderId);
		if (error) throw error;
		const { error: delErr } = await supabase.from("purchase_order_items").delete().eq("purchase_order_id", orderId);
		if (delErr) throw delErr;
	} else {
		const { data, error } = await supabase.from("purchase_orders").insert(payload).select("id").single();
		if (error) throw error;
		orderId = data.id;
	}
	const rows = items.filter((i) => i.description.trim() || i.product_id).map((i) => ({
		purchase_order_id: orderId,
		product_id: i.product_id,
		description: i.description,
		quantity: i.quantity,
		unit_cost: i.unit_cost
	}));
	if (rows.length > 0) {
		const { error } = await supabase.from("purchase_order_items").insert(rows);
		if (error) throw error;
	}
	return orderId;
}
async function deletePurchaseOrder(id) {
	const { error } = await supabase.from("purchase_orders").delete().eq("id", id);
	if (error) throw error;
}
async function uploadReceipt(file) {
	const ext = file.name.split(".").pop() ?? "jpg";
	const path = `receipts/${crypto.randomUUID()}.${ext}`;
	const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
	if (error) throw error;
	return path;
}
function fileToDataUrl$1(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not read file"));
		reader.readAsDataURL(file);
	});
}
/** Downscale a photo/screenshot so the AI scan payload stays small and fast. */
async function fileToScanDataUrl(file, maxSide = 1600) {
	const original = await fileToDataUrl$1(file);
	try {
		const img = await new Promise((resolve, reject) => {
			const el = new Image();
			el.onload = () => resolve(el);
			el.onerror = () => reject(/* @__PURE__ */ new Error("Could not read image"));
			el.src = original;
		});
		const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
		if (scale === 1 && original.length < 15e5) return original;
		const canvas = document.createElement("canvas");
		canvas.width = Math.round(img.width * scale);
		canvas.height = Math.round(img.height * scale);
		const ctx = canvas.getContext("2d");
		if (!ctx) return original;
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		return canvas.toDataURL("image/jpeg", .85);
	} catch {
		return original;
	}
}
/** Units already paid for but not yet received, per product id. */
function incomingByProduct(orders) {
	const map = /* @__PURE__ */ new Map();
	orders.filter((o) => o.status !== "received").forEach((o) => o.items.forEach((i) => {
		if (!i.product_id) return;
		map.set(i.product_id, (map.get(i.product_id) ?? 0) + i.quantity);
	}));
	return map;
}
function DashboardPanel({ products, orders }) {
	const stats = (0, import_react.useMemo)(() => {
		return {
			units: products.reduce((s, p) => s + p.stock_qty, 0),
			costValue: products.reduce((s, p) => s + p.stock_qty * p.cost_price, 0),
			retailValue: products.reduce((s, p) => s + p.stock_qty * p.price, 0),
			spend: orders.filter((o) => o.status !== "draft").reduce((s, o) => s + orderTotal(o), 0),
			lowStock: products.filter((p) => p.stock_qty > 0 && p.stock_qty <= 2),
			outOfStock: products.filter((p) => p.stock_qty === 0)
		};
	}, [products, orders]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-3xl text-silver-gradient",
				children: "Back office"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Live inventory value, spend and expected profit."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boxes, { className: "h-4 w-4" }),
						label: "Units in stock",
						value: String(stats.units)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "h-4 w-4" }),
						label: "Stock at cost",
						value: formatZAR(stats.costValue)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4" }),
						label: "Expected profit",
						value: formatZAR(stats.retailValue - stats.costValue),
						hint: `Retail value ${formatZAR(stats.retailValue)}`,
						accent: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-4 w-4" }),
						label: "Purchase spend",
						value: formatZAR(stats.spend),
						hint: `${orders.length} order${orders.length === 1 ? "" : "s"}`
					})
				]
			}),
			(stats.lowStock.length > 0 || stats.outOfStock.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 text-xs uppercase tracking-widest text-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4" }), " Needs restocking"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2 text-sm",
					children: [...stats.outOfStock, ...stats.lowStock].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate text-foreground",
							children: p.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: p.stock_qty === 0 ? "text-destructive" : "text-muted-foreground",
							children: p.stock_qty === 0 ? "Sold out" : `${p.stock_qty} left`
						})]
					}, p.id))
				})]
			})
		]
	});
}
function Stat({ icon, label, value, hint, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded border p-4 ${accent ? "border-primary/40 bg-gradient-to-br from-primary/10 to-transparent" : "border-border bg-card"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground",
				children: [
					icon,
					" ",
					label
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-serif text-2xl text-silver-gradient",
				children: value
			}),
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[11px] text-muted-foreground",
				children: hint
			})
		]
	});
}
var MAX_DIM = 1600;
async function fileToDataUrl(file) {
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
	const w = Math.round(bitmap.width * scale);
	const h = Math.round(bitmap.height * scale);
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not read that image.");
	ctx.drawImage(bitmap, 0, 0, w, h);
	bitmap.close();
	return canvas.toDataURL("image/jpeg", .92);
}
async function dataUrlToFile(dataUrl, name) {
	const blob = await (await fetch(dataUrl)).blob();
	const ext = blob.type.includes("png") ? "png" : "jpg";
	return new File([blob], `${name}.${ext}`, { type: blob.type || "image/png" });
}
async function postEnhance(dataUrl, instruction) {
	const { data: sessionData } = await supabase.auth.getSession();
	const token = sessionData.session?.access_token;
	if (!token) throw new Error("Your session expired — sign in again.");
	const res = await fetch("/api/enhance-image", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			dataUrl,
			instruction
		})
	});
	if (!res.ok || !res.body) throw new Error(await res.text().catch(() => "") || `Enhance failed (${res.status})`);
	return res.body;
}
async function parseStream(body, onFrame) {
	let sawCompleted = false;
	let streamError;
	const parser = createParser({ onEvent(event) {
		let payload;
		try {
			payload = JSON.parse(event.data);
		} catch {
			return;
		}
		if (event.event === "error" || payload?.type === "error") {
			streamError = payload?.error?.message ?? "Enhance failed";
			return;
		}
		if (event.event !== "image_edit.partial_image" && event.event !== "image_edit.completed") return;
		const b64 = payload.b64_json;
		if (!b64) return;
		const isFinal = event.event === "image_edit.completed";
		(0, import_react_dom.flushSync)(() => onFrame(`data:image/png;base64,${b64}`, isFinal));
		if (isFinal) sawCompleted = true;
	} });
	const reader = body.pipeThrough(new TextDecoderStream()).getReader();
	try {
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			parser.feed(value);
		}
	} finally {
		reader.cancel().catch(() => {});
	}
	if (streamError) throw new Error(streamError);
	return sawCompleted;
}
async function fetchNonStreaming(dataUrl, instruction, onFrame) {
	const { data: sessionData } = await supabase.auth.getSession();
	const token = sessionData.session?.access_token;
	if (!token) throw new Error("Your session expired — sign in again.");
	const res = await fetch("/api/enhance-image", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			dataUrl,
			instruction
		})
	});
	if (!res.ok) throw new Error(await res.text().catch(() => "") || `Enhance failed (${res.status})`);
	const b64 = (await res.json()).data?.[0]?.b64_json;
	if (!b64) throw new Error("The AI didn't return an image — try again.");
	(0, import_react_dom.flushSync)(() => onFrame(`data:image/png;base64,${b64}`, true));
}
async function enhanceImage(dataUrl, instruction, onFrame) {
	if (!await parseStream(await postEnhance(dataUrl, instruction), onFrame)) await fetchNonStreaming(dataUrl, instruction, onFrame);
}
var PRESETS = [
	{
		id: "studio",
		label: "Clean studio white",
		prompt: "Place the item on a seamless pure white studio background with soft, even light, gentle natural shadow beneath it, and crisp detail."
	},
	{
		id: "luxe",
		label: "Luxe black",
		prompt: "Place the item on a dark reflective black surface with dramatic soft key light and a subtle reflection, luxury jewellery advertising style."
	},
	{
		id: "brighten",
		label: "Brighten & sharpen",
		prompt: "Keep the existing background. Fix exposure, white balance and colour, remove noise, and sharpen the item so it looks professionally photographed."
	},
	{
		id: "cutout",
		label: "Remove background",
		prompt: "Remove the background completely and place the item alone on a plain flat white backdrop, centred, with a soft contact shadow."
	}
];
function ImageEnhancer({ file, onCancel, onAccept }) {
	const [originalUrl] = (0, import_react.useState)(() => URL.createObjectURL(file));
	const [preset, setPreset] = (0, import_react.useState)(PRESETS[0].id);
	const [extra, setExtra] = (0, import_react.useState)("");
	const [result, setResult] = (0, import_react.useState)(null);
	const [isFinal, setIsFinal] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	async function run() {
		setBusy(true);
		setError(null);
		setResult(null);
		setIsFinal(false);
		try {
			const instruction = [PRESETS.find((p) => p.id === preset)?.prompt ?? "", extra.trim()].filter(Boolean).join(" ");
			await enhanceImage(await fileToDataUrl(file), instruction, (url, final) => {
				setResult(url);
				if (final) setIsFinal(true);
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Enhance failed");
		} finally {
			setBusy(false);
		}
	}
	async function accept() {
		if (!result) return;
		onAccept(await dataUrlToFile(result, `enhanced-${Date.now()}`));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[60] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:rounded sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-serif text-xl text-silver-gradient",
						children: "AI photo studio"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Restyles lighting and background only — the item itself stays exactly as photographed."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onCancel,
						className: "rounded border border-border p-1.5 text-muted-foreground hover:text-foreground",
						"aria-label": "Close",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] uppercase tracking-widest text-muted-foreground",
						children: "Original"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: originalUrl,
						alt: "Original",
						className: "mt-1 aspect-square w-full rounded object-cover"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] uppercase tracking-widest text-muted-foreground",
						children: "Enhanced"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 flex aspect-square w-full items-center justify-center overflow-hidden rounded border border-dashed border-border bg-background/60",
						children: result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: result,
							alt: "Enhanced",
							className: `h-full w-full object-cover transition-[filter] duration-500 ${isFinal ? "blur-0" : "blur-xl"}`
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "px-4 text-center text-xs text-muted-foreground",
							children: busy ? "Working on it…" : "Pick a look and tap Enhance"
						})
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setPreset(p.id),
						className: `rounded border px-3 py-1.5 text-[11px] uppercase tracking-widest transition ${preset === p.id ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"}`,
						children: p.label
					}, p.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					rows: 2,
					value: extra,
					onChange: (e) => setExtra(e.target.value),
					placeholder: "Optional extra instruction, e.g. show it on a marble slab",
					className: "mt-3 w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap justify-end gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onCancel,
							className: "rounded border border-border px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground",
							children: "Cancel"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void run(),
							disabled: busy,
							className: "flex items-center gap-2 rounded border border-primary px-4 py-2 text-xs uppercase tracking-widest text-primary disabled:opacity-60",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" }), busy ? "Enhancing…" : result ? "Re-run" : "Enhance"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void accept(),
							disabled: !result || !isFinal || busy,
							className: "rounded bg-gradient-to-r from-primary to-purple-glow px-4 py-2 text-xs font-medium uppercase tracking-widest text-primary-foreground disabled:opacity-40",
							children: "Use this image"
						})
					]
				})
			]
		})
	});
}
var inputCls = "w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: "text-xs uppercase tracking-widest text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1",
		children
	})] });
}
function ProductForm({ product, onClose, onSaved }) {
	const [name, setName] = (0, import_react.useState)(product?.name ?? "");
	const [description, setDescription] = (0, import_react.useState)(product?.description ?? "");
	const [price, setPrice] = (0, import_react.useState)(product?.price ? String(product.price) : "");
	const [cost, setCost] = (0, import_react.useState)(product?.cost_price ? String(product.cost_price) : "");
	const [stockQty, setStockQty] = (0, import_react.useState)(String(product?.stock_qty ?? 0));
	const [preorder, setPreorder] = (0, import_react.useState)(product?.preorder ?? false);
	const [preorderEta, setPreorderEta] = (0, import_react.useState)(product?.preorder_eta ?? PREORDER_WINDOWS[1]);
	const [category, setCategory] = (0, import_react.useState)(product?.category ?? "925 Silver");
	const [file, setFile] = (0, import_react.useState)(null);
	const [galleryFiles, setGalleryFiles] = (0, import_react.useState)([]);
	const [existingGallery, setExistingGallery] = (0, import_react.useState)(product?.images ?? []);
	const existingSignedGallery = (product?.signed_image_urls ?? []).filter((u) => u !== product?.signed_image_url);
	const [enhancing, setEnhancing] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const enhanceTargetFile = enhancing?.kind === "main" ? file : enhancing?.kind === "gallery" ? galleryFiles[enhancing.index] ?? null : null;
	function applyEnhanced(next) {
		if (enhancing?.kind === "main") setFile(next);
		else if (enhancing?.kind === "gallery") {
			const idx = enhancing.index;
			setGalleryFiles((prev) => prev.map((f, i) => i === idx ? next : f));
		}
		setEnhancing(null);
	}
	const priceNum = Number(price) || 0;
	const costNum = Number(cost) || 0;
	const margin = priceNum > 0 ? (priceNum - costNum) / priceNum * 100 : 0;
	async function uploadOne(f) {
		const ext = f.name.split(".").pop() ?? "jpg";
		const path = `${crypto.randomUUID()}.${ext}`;
		const { error: upErr } = await supabase.storage.from("product-images").upload(path, f, {
			upsert: false,
			contentType: f.type
		});
		if (upErr) throw upErr;
		return path;
	}
	async function handleSubmit(e) {
		e.preventDefault();
		setError(null);
		setSaving(true);
		try {
			let image_url = product?.image_url ?? null;
			if (file) {
				const newPath = await uploadOne(file);
				if (product?.image_url) await supabase.storage.from("product-images").remove([product.image_url]);
				image_url = newPath;
			}
			const uploadedGallery = [];
			for (const f of galleryFiles) uploadedGallery.push(await uploadOne(f));
			const finalGallery = [...existingGallery, ...uploadedGallery];
			const removedFromGallery = (product?.images ?? []).filter((p) => !existingGallery.includes(p));
			if (removedFromGallery.length > 0) await supabase.storage.from("product-images").remove(removedFromGallery);
			const qty = Math.max(0, Math.round(Number(stockQty) || 0));
			const payload = {
				name,
				description: description || null,
				price: priceNum,
				category,
				stock_qty: qty,
				in_stock: qty > 0,
				preorder,
				preorder_eta: preorder ? preorderEta : null,
				image_url,
				images: finalGallery
			};
			let productId = product?.id;
			if (product) {
				const { error: err } = await supabase.from("products").update(payload).eq("id", product.id);
				if (err) throw err;
			} else {
				const { data, error: err } = await supabase.from("products").insert(payload).select("id").single();
				if (err) throw err;
				productId = data.id;
			}
			if (productId) await saveProductCost(productId, costNum);
			onSaved();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:rounded sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-2xl text-silver-gradient",
					children: product ? "Edit product" : "New product"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								value: name,
								onChange: (e) => setName(e.target.value),
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Description",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								rows: 3,
								value: description,
								onChange: (e) => setDescription(e.target.value),
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Selling price (ZAR)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: 0,
									step: "0.01",
									required: true,
									inputMode: "decimal",
									value: price,
									onChange: (e) => setPrice(e.target.value),
									className: inputCls
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Cost price (ZAR)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: 0,
									step: "0.01",
									inputMode: "decimal",
									value: cost,
									onChange: (e) => setCost(e.target.value),
									className: inputCls
								})
							})]
						}),
						priceNum > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs uppercase tracking-widest text-muted-foreground",
							children: [
								"Profit per unit:",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-primary",
									children: [
										"R ",
										(priceNum - costNum).toFixed(2),
										" (",
										margin.toFixed(0),
										"%)"
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Category",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: category,
									onChange: (e) => setCategory(e.target.value),
									className: inputCls,
									children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: c,
										children: c
									}, c))
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Stock quantity",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: 0,
									step: "1",
									inputMode: "numeric",
									value: stockQty,
									onChange: (e) => setStockQty(e.target.value),
									className: inputCls
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded border border-border/70 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: preorder,
									onChange: (e) => setPreorder(e.target.checked),
									className: "mt-0.5 h-4 w-4 accent-[var(--primary)]"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-foreground",
									children: "Available for pre-order"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-[11px] text-muted-foreground",
									children: "Shows on the store even with zero stock, with an arrival window."
								})] })]
							}), preorder && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Rough arrival window",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: preorderEta ?? "",
										onChange: (e) => setPreorderEta(e.target.value),
										className: "w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary",
										children: PREORDER_WINDOWS.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: w,
											children: w
										}, w))
									})
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
							label: "Main image",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: "image/*",
									onChange: (e) => setFile(e.target.files?.[0] ?? null),
									className: "w-full text-xs text-muted-foreground file:mr-3 file:rounded file:border-0 file:bg-primary/20 file:px-3 file:py-1.5 file:text-primary"
								}),
								file && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: URL.createObjectURL(file),
										alt: "",
										className: "h-20 w-20 rounded object-cover"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setEnhancing({ kind: "main" }),
										className: "flex items-center gap-2 rounded border border-primary px-3 py-1.5 text-[11px] uppercase tracking-widest text-primary",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" }), " Enhance with AI"]
									})]
								}),
								product?.signed_image_url && !file && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: product.signed_image_url,
									alt: "",
									className: "mt-2 h-20 w-20 rounded object-cover"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
							label: "Additional gallery images",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: "image/*",
									multiple: true,
									onChange: (e) => setGalleryFiles(e.target.files ? Array.from(e.target.files) : []),
									className: "w-full text-xs text-muted-foreground file:mr-3 file:rounded file:border-0 file:bg-primary/20 file:px-3 file:py-1.5 file:text-primary"
								}),
								existingGallery.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex flex-wrap gap-2",
									children: existingGallery.map((path, idx) => {
										const url = existingSignedGallery[idx];
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative",
											children: [url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: url,
												alt: "",
												className: "h-16 w-16 rounded object-cover"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setExistingGallery((prev) => prev.filter((p) => p !== path)),
												className: "absolute -right-1.5 -top-1.5 rounded-full bg-destructive px-1.5 text-xs text-destructive-foreground",
												"aria-label": "Remove image",
												children: "×"
											})]
										}, path);
									})
								}),
								galleryFiles.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex flex-wrap gap-2",
									children: galleryFiles.map((f, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: URL.createObjectURL(f),
											alt: "",
											className: "h-16 w-16 rounded object-cover"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setEnhancing({
												kind: "gallery",
												index: idx
											}),
											className: "flex items-center gap-1 rounded border border-primary px-2 py-1 text-[9px] uppercase tracking-widest text-primary",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }), " AI"]
										})]
									}, `${f.name}-${idx}`))
								})
							]
						})
					]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex justify-end gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "rounded border border-border px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: saving,
						className: "rounded bg-gradient-to-r from-primary to-purple-glow px-4 py-2 text-xs font-medium uppercase tracking-widest text-primary-foreground disabled:opacity-60",
						children: saving ? "Saving…" : "Save"
					})]
				})
			]
		}), enhancing && enhanceTargetFile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageEnhancer, {
			file: enhanceTargetFile,
			onCancel: () => setEnhancing(null),
			onAccept: applyEnhanced
		})]
	});
}
function ProductsPanel({ products, isLoading, refetch }) {
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [showForm, setShowForm] = (0, import_react.useState)(false);
	async function handleDelete(p) {
		if (!confirm(`Delete "${p.name}"?`)) return;
		const toRemove = [...p.image_url ? [p.image_url] : [], ...p.images ?? []];
		if (toRemove.length > 0) await supabase.storage.from("product-images").remove(toRemove);
		const { error } = await supabase.from("products").delete().eq("id", p.id);
		if (error) return alert(error.message);
		refetch();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-3xl text-silver-gradient",
				children: "Products"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Manage the storefront catalog."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => {
					setEditing(null);
					setShowForm(true);
				},
				className: "flex items-center gap-2 rounded bg-gradient-to-r from-primary to-purple-glow px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-primary-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " New product"]
			})]
		}),
		isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: "Loading…"
		}) : products.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "rounded border border-border px-4 py-12 text-center text-muted-foreground",
			children: "No products yet. Add your first piece."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3 md:space-y-0 md:overflow-hidden md:rounded md:border md:border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "hidden w-full text-sm md:table",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "border-b border-border bg-muted/40 text-left text-xs uppercase tracking-widest text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Image"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Category"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Cost"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Price"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Qty"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-right",
							children: "Actions"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/60",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-12 w-12 overflow-hidden rounded bg-muted",
								children: p.signed_image_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: p.signed_image_url,
									alt: "",
									className: "h-full w-full object-cover"
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-foreground",
							children: p.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: p.category
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: formatZAR(p.cost_price)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-silver",
							children: formatZAR(p.price)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${p.stock_qty > 0 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`,
								children: p.stock_qty > 0 ? `${p.stock_qty} in stock` : "Sold out"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-end gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => {
										setEditing(p);
										setShowForm(true);
									},
									className: "rounded border border-border p-1.5 text-muted-foreground hover:border-primary hover:text-primary",
									"aria-label": "Edit",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => handleDelete(p),
									className: "rounded border border-border p-1.5 text-muted-foreground hover:border-destructive hover:text-destructive",
									"aria-label": "Delete",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
								})]
							})
						})
					]
				}, p.id)) })]
			}), products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3 rounded border border-border bg-card p-3 md:hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-16 w-16 shrink-0 overflow-hidden rounded bg-muted",
						children: p.signed_image_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: p.signed_image_url,
							alt: "",
							className: "h-full w-full object-cover"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm text-foreground",
								children: p.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] uppercase tracking-widest text-muted-foreground",
								children: [
									p.category,
									" · ",
									p.stock_qty,
									" in stock"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-silver",
								children: [
									formatZAR(p.price),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted-foreground",
										children: ["cost ", formatZAR(p.cost_price)]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setEditing(p);
								setShowForm(true);
							},
							className: "rounded border border-border p-2 text-muted-foreground",
							"aria-label": "Edit",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => handleDelete(p),
							className: "rounded border border-border p-2 text-muted-foreground",
							"aria-label": "Delete",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
						})]
					})
				]
			}, p.id))]
		}),
		showForm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductForm, {
			product: editing,
			onClose: () => setShowForm(false),
			onSaved: () => {
				setShowForm(false);
				refetch();
			}
		})
	] });
}
var VIEWS = [
	{
		id: "instock",
		label: "In stock"
	},
	{
		id: "incoming",
		label: "On order"
	},
	{
		id: "out",
		label: "Out of stock"
	},
	{
		id: "all",
		label: "All"
	}
];
function InventoryPanel({ products, orders, refetch }) {
	const [drafts, setDrafts] = (0, import_react.useState)({});
	const [savingId, setSavingId] = (0, import_react.useState)(null);
	const [view, setView] = (0, import_react.useState)("instock");
	const incoming = (0, import_react.useMemo)(() => incomingByProduct(orders), [orders]);
	function qtyOf(p) {
		return drafts[p.id] ?? p.stock_qty;
	}
	function bump(p, delta) {
		setDrafts((d) => ({
			...d,
			[p.id]: Math.max(0, qtyOf(p) + delta)
		}));
	}
	async function commit(p) {
		const qty = qtyOf(p);
		if (qty === p.stock_qty) return;
		setSavingId(p.id);
		try {
			await saveStockQty(p.id, qty);
			setDrafts((d) => {
				const next = { ...d };
				delete next[p.id];
				return next;
			});
			refetch();
		} catch (e) {
			alert(e instanceof Error ? e.message : "Could not update stock");
		} finally {
			setSavingId(null);
		}
	}
	const counts = {
		instock: products.filter((p) => p.stock_qty > 0).length,
		incoming: products.filter((p) => (incoming.get(p.id) ?? 0) > 0).length,
		out: products.filter((p) => p.stock_qty === 0).length,
		all: products.length
	};
	const visible = products.filter((p) => {
		const inc = incoming.get(p.id) ?? 0;
		if (view === "instock") return p.stock_qty > 0;
		if (view === "incoming") return inc > 0;
		if (view === "out") return p.stock_qty === 0;
		return true;
	});
	const totalIncoming = [...incoming.values()].reduce((s, n) => s + n, 0);
	const totalInStock = products.reduce((s, p) => s + p.stock_qty, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-3xl text-silver-gradient",
				children: "Inventory"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: [
					totalInStock,
					" unit",
					totalInStock === 1 ? "" : "s",
					" on hand ·",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-primary",
						children: totalIncoming
					}),
					" on order (available for pre-order)."
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: VIEWS.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setView(v.id),
					className: `rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-widest transition ${view === v.id ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"}`,
					children: [
						v.label,
						" (",
						counts[v.id],
						")"
					]
				}, v.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [visible.map((p) => {
					const qty = qtyOf(p);
					const dirty = qty !== p.stock_qty;
					const inc = incoming.get(p.id) ?? 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3 rounded border border-border bg-card p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-12 w-12 shrink-0 overflow-hidden rounded bg-muted",
								children: p.signed_image_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: p.signed_image_url,
									alt: "",
									className: "h-full w-full object-cover"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm text-foreground",
										children: p.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[11px] uppercase tracking-widest text-muted-foreground",
										children: [
											"cost ",
											formatZAR(p.cost_price),
											" · sell ",
											formatZAR(p.price),
											" · profit",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-primary",
												children: formatZAR(p.price - p.cost_price)
											})
										]
									}),
									inc > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "h-3 w-3" }),
											" ",
											inc,
											" on order"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => bump(p, -1),
										className: "rounded border border-border p-2 text-muted-foreground hover:text-foreground",
										"aria-label": "Decrease",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-3.5 w-3.5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										min: 0,
										inputMode: "numeric",
										value: qty,
										onChange: (e) => setDrafts((d) => ({
											...d,
											[p.id]: Math.max(0, Math.round(Number(e.target.value) || 0))
										})),
										className: "w-16 rounded border border-input bg-background px-2 py-2 text-center text-sm text-foreground outline-none focus:border-primary"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => bump(p, 1),
										className: "rounded border border-border p-2 text-muted-foreground hover:text-foreground",
										"aria-label": "Increase",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => commit(p),
										disabled: !dirty || savingId === p.id,
										className: "ml-1 rounded bg-gradient-to-r from-primary to-purple-glow p-2 text-primary-foreground disabled:opacity-30",
										"aria-label": "Save stock",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" })
									})
								]
							})
						]
					}, p.id);
				}), visible.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded border border-border px-4 py-12 text-center text-muted-foreground",
					children: "Nothing here yet."
				})]
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var scanReceipt = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((input) => object({ dataUrl: string().min(32) }).parse(input)).handler(createSsrRpc("e23f739052537814819c58cf9d299e571b86705b2488cbafb60f4c6802d3de9b"));
var STATUSES = [
	"draft",
	"ordered",
	"received"
];
function PurchasesPanel({ orders, products, isLoading, refetch }) {
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [showForm, setShowForm] = (0, import_react.useState)(false);
	async function handleDelete(po) {
		if (!confirm(`Delete purchase from "${po.supplier || "unknown supplier"}"?`)) return;
		try {
			await deletePurchaseOrder(po.id);
			refetch();
		} catch (e) {
			alert(e instanceof Error ? e.message : "Could not delete");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-3xl text-silver-gradient",
				children: "Purchases"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Log what you bought — or snap the receipt and let AI capture it."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => {
					setEditing(null);
					setShowForm(true);
				},
				className: "flex items-center gap-2 rounded bg-gradient-to-r from-primary to-purple-glow px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-primary-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " New purchase"]
			})]
		}),
		isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: "Loading…"
		}) : orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "rounded border border-border px-4 py-12 text-center text-muted-foreground",
			children: "No purchase orders yet."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: orders.map((po) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-sm text-foreground",
							children: [po.supplier || "Unknown supplier", po.reference && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [" · ", po.reference]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] uppercase tracking-widest text-muted-foreground",
							children: [
								po.order_date,
								" · ",
								po.items.length,
								" item",
								po.items.length === 1 ? "" : "s"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${po.status === "received" ? "bg-primary/15 text-primary" : po.status === "ordered" ? "bg-muted text-foreground" : "bg-muted text-muted-foreground"}`,
								children: po.status
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-serif text-lg text-silver-gradient",
								children: formatZAR(orderTotal(po))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									setEditing(po);
									setShowForm(true);
								},
								className: "rounded border border-border p-1.5 text-muted-foreground hover:border-primary hover:text-primary",
								"aria-label": "Edit purchase",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => handleDelete(po),
								className: "rounded border border-border p-1.5 text-muted-foreground hover:border-destructive hover:text-destructive",
								"aria-label": "Delete purchase",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
							})
						]
					})]
				}), po.items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground",
					children: po.items.map((i, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "truncate",
							children: [
								i.quantity,
								" × ",
								i.description || "Item"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatZAR(i.quantity * i.unit_cost) })]
					}, i.id ?? idx))
				})]
			}, po.id))
		}),
		showForm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PurchaseForm, {
			order: editing,
			products,
			onClose: () => setShowForm(false),
			onSaved: () => {
				setShowForm(false);
				refetch();
			}
		})
	] });
}
function emptyItem() {
	return {
		product_id: null,
		description: "",
		quantity: 1,
		unit_cost: 0
	};
}
function PurchaseForm({ order, products, onClose, onSaved }) {
	const runScan = useServerFn(scanReceipt);
	const [supplier, setSupplier] = (0, import_react.useState)(order?.supplier ?? "");
	const [reference, setReference] = (0, import_react.useState)(order?.reference ?? "");
	const [orderDate, setOrderDate] = (0, import_react.useState)(order?.order_date ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const [status, setStatus] = (0, import_react.useState)(order?.status ?? "ordered");
	const [shipping, setShipping] = (0, import_react.useState)(String(order?.shipping_cost ?? 0));
	const [notes, setNotes] = (0, import_react.useState)(order?.notes ?? "");
	const [receiptPath, setReceiptPath] = (0, import_react.useState)(order?.receipt_image ?? null);
	const [items, setItems] = (0, import_react.useState)(order?.items.length ? order.items : [emptyItem()]);
	const [preorderIds, setPreorderIds] = (0, import_react.useState)(products.filter((p) => p.preorder).map((p) => p.id));
	const [preorderEta, setPreorderEta] = (0, import_react.useState)(products.find((p) => p.preorder && p.preorder_eta)?.preorder_eta ?? PREORDER_WINDOWS[1]);
	const [scanning, setScanning] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const total = items.reduce((s, i) => s + i.quantity * i.unit_cost, 0) + (Number(shipping) || 0);
	function setItem(idx, patch) {
		setItems((prev) => prev.map((it, i) => i === idx ? {
			...it,
			...patch
		} : it));
	}
	async function handleScreenshot(file) {
		setError(null);
		setScanning(true);
		try {
			const dataUrl = await fileToScanDataUrl(file);
			const result = await runScan({ data: { dataUrl } });
			if (result.supplier) setSupplier(result.supplier);
			if (result.reference) setReference(result.reference);
			if (result.order_date && /^\d{4}-\d{2}-\d{2}$/.test(result.order_date)) setOrderDate(result.order_date);
			if (result.shipping_cost != null) setShipping(String(result.shipping_cost));
			if (result.notes) setNotes(result.notes);
			if (result.items.length > 0) setItems(result.items.map((i) => {
				return {
					product_id: products.find((p) => p.name.toLowerCase() === i.description.trim().toLowerCase())?.id ?? null,
					description: i.description,
					quantity: Math.max(1, Math.round(i.quantity || 1)),
					unit_cost: i.unit_cost || 0
				};
			}));
			else setError("Couldn't read any line items — please fill them in manually.");
			try {
				setReceiptPath(await uploadReceipt(file));
			} catch {}
		} catch (e) {
			setError(e instanceof Error ? e.message : "Scan failed");
		} finally {
			setScanning(false);
		}
	}
	async function handleSubmit(e) {
		e.preventDefault();
		setError(null);
		setSaving(true);
		try {
			await savePurchaseOrder({
				...order ? { id: order.id } : {},
				supplier,
				reference: reference || null,
				order_date: orderDate,
				status,
				notes: notes || null,
				receipt_image: receiptPath,
				shipping_cost: Number(shipping) || 0
			}, items);
			const linked = [...new Set(items.map((i) => i.product_id).filter(Boolean))];
			for (const pid of linked) {
				const p = products.find((x) => x.id === pid);
				if (!p) continue;
				const want = preorderIds.includes(pid);
				if (want !== p.preorder || want && p.preorder_eta !== preorderEta) await setPreorder(pid, want, preorderEta);
			}
			onSaved();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:rounded sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-2xl text-silver-gradient",
					children: order ? "Edit purchase" : "New purchase"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 flex cursor-pointer items-center gap-3 rounded border border-dashed border-primary/50 bg-primary/5 p-4",
					children: [
						scanning ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-5 w-5 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm text-foreground",
							children: [scanning ? "Reading your receipt…" : "Scan a receipt screenshot with AI", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-[11px] uppercase tracking-widest text-muted-foreground",
								children: "Take a photo or upload a screenshot"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: "image/*",
							className: "hidden",
							disabled: scanning,
							onChange: (e) => {
								const f = e.target.files?.[0];
								if (f) handleScreenshot(f);
								e.target.value = "";
							}
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 grid gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Supplier",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: supplier,
								onChange: (e) => setSupplier(e.target.value),
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Reference",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: reference,
								onChange: (e) => setReference(e.target.value),
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Order date",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								value: orderDate,
								onChange: (e) => setOrderDate(e.target.value),
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Status",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: status,
								onChange: (e) => setStatus(e.target.value),
								className: inputCls,
								children: STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s,
									children: s
								}, s))
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-[11px] text-muted-foreground",
					children: [
						"Marking a purchase as ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-primary",
							children: "received"
						}),
						" adds its linked products back into stock."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-widest text-muted-foreground",
							children: "Items"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 space-y-3",
							children: items.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded border border-border/70 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-2 sm:grid-cols-[1fr_5rem_7rem_auto] sm:items-center",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												placeholder: "Description",
												value: item.description,
												onChange: (e) => setItem(idx, { description: e.target.value }),
												className: inputCls
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: 1,
												inputMode: "numeric",
												placeholder: "Qty",
												value: item.quantity,
												onChange: (e) => setItem(idx, { quantity: Math.max(1, Number(e.target.value) || 1) }),
												className: inputCls
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: 0,
												step: "0.01",
												inputMode: "decimal",
												placeholder: "Unit cost",
												value: item.unit_cost,
												onChange: (e) => setItem(idx, { unit_cost: Number(e.target.value) || 0 }),
												className: inputCls
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setItems((prev) => prev.filter((_, i) => i !== idx)),
												className: "justify-self-end rounded border border-border p-2 text-muted-foreground hover:border-destructive hover:text-destructive",
												"aria-label": "Remove item",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: item.product_id ?? "",
										onChange: (e) => setItem(idx, { product_id: e.target.value || null }),
										className: `${inputCls} mt-2`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Not linked to a product"
										}), products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: p.id,
											children: p.name
										}, p.id))]
									}),
									item.product_id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "mt-2 flex items-center gap-2 text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: preorderIds.includes(item.product_id),
											onChange: (e) => {
												const pid = item.product_id;
												setPreorderIds((prev) => e.target.checked ? [.../* @__PURE__ */ new Set([...prev, pid])] : prev.filter((x) => x !== pid));
											},
											className: "h-4 w-4 accent-[var(--primary)]"
										}), "Sell this on the store as a pre-order"]
									})
								]
							}, idx))
						}),
						items.some((i) => i.product_id && preorderIds.includes(i.product_id)) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 max-w-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Pre-order arrival window shown to customers",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: preorderEta,
									onChange: (e) => setPreorderEta(e.target.value),
									className: "w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary",
									children: PREORDER_WINDOWS.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: w,
										children: w
									}, w))
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setItems((prev) => [...prev, emptyItem()]),
							className: "mt-3 flex items-center gap-2 rounded border border-border px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-primary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add item"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 grid gap-4 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Shipping / other costs (ZAR)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							min: 0,
							step: "0.01",
							inputMode: "decimal",
							value: shipping,
							onChange: (e) => setShipping(e.target.value),
							className: inputCls
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Notes",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: notes,
							onChange: (e) => setNotes(e.target.value),
							className: inputCls
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 text-right font-serif text-2xl text-silver-gradient",
					children: formatZAR(total)
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex justify-end gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "rounded border border-border px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: saving,
						className: "rounded bg-gradient-to-r from-primary to-purple-glow px-4 py-2 text-xs font-medium uppercase tracking-widest text-primary-foreground disabled:opacity-60",
						children: saving ? "Saving…" : "Save purchase"
					})]
				})
			]
		})
	});
}
var TABS = [
	{
		id: "overview",
		label: "Overview",
		icon: LayoutDashboard
	},
	{
		id: "products",
		label: "Products",
		icon: Package
	},
	{
		id: "inventory",
		label: "Inventory",
		icon: Boxes
	},
	{
		id: "purchases",
		label: "Purchases",
		icon: Receipt
	}
];
function AdminPage() {
	const navigate = useNavigate();
	const qc = useQueryClient();
	const [isAdmin, setIsAdmin] = (0, import_react.useState)(null);
	const [email, setEmail] = (0, import_react.useState)(null);
	const [tab, setTab] = (0, import_react.useState)("overview");
	(0, import_react.useEffect)(() => {
		(async () => {
			const { data } = await supabase.auth.getUser();
			if (!data.user) return;
			setEmail(data.user.email ?? null);
			const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
			setIsAdmin(!!roles?.some((r) => r.role === "admin"));
		})();
	}, []);
	const productsQuery = useQuery({
		queryKey: ["admin-products"],
		queryFn: fetchAdminProducts,
		enabled: isAdmin === true
	});
	const ordersQuery = useQuery({
		queryKey: ["purchase-orders"],
		queryFn: fetchPurchaseOrders,
		enabled: isAdmin === true
	});
	const products = productsQuery.data ?? [];
	const orders = ordersQuery.data ?? [];
	async function handleSignOut() {
		await qc.cancelQueries();
		qc.clear();
		await supabase.auth.signOut();
		navigate({
			to: "/auth",
			replace: true
		});
	}
	if (isAdmin === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center text-muted-foreground",
		children: "Loading…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background pb-24 md:pb-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: csl_luxe_logo_default,
							alt: "CSL Luxe",
							className: "h-9 w-9 object-contain"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-serif text-sm tracking-widest text-silver-gradient",
							children: "CSL LUXE"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] uppercase tracking-[0.3em] text-primary/80",
							children: "Back office"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden text-xs uppercase tracking-widest text-muted-foreground sm:inline",
							children: email
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: handleSignOut,
							className: "flex items-center gap-2 rounded border border-border px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground transition hover:border-primary hover:text-primary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Sign out"
							})]
						})]
					})]
				}), isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto hidden max-w-7xl gap-1 px-6 md:flex",
					children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setTab(t.id),
						className: `flex items-center gap-2 border-b-2 px-4 py-3 text-xs uppercase tracking-widest transition ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "h-4 w-4" }),
							" ",
							t.label
						]
					}, t.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10",
				children: !isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-lg rounded border border-border bg-card p-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mx-auto h-10 w-10 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-4 font-serif text-2xl text-silver-gradient",
							children: "Admin access required"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: "Your account is signed in but doesn't have admin privileges. Ask an existing admin to grant you access."
						})
					]
				}) : tab === "overview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardPanel, {
					products,
					orders
				}) : tab === "products" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductsPanel, {
					products,
					isLoading: productsQuery.isLoading,
					refetch: () => void productsQuery.refetch()
				}) : tab === "inventory" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InventoryPanel, {
					products,
					orders,
					refetch: () => void productsQuery.refetch()
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PurchasesPanel, {
					orders,
					products,
					isLoading: ordersQuery.isLoading,
					refetch: () => {
						ordersQuery.refetch();
						productsQuery.refetch();
					}
				})
			}),
			isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-lg md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-4",
					children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setTab(t.id),
						className: `flex flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-widest transition ${tab === t.id ? "text-primary" : "text-muted-foreground"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "h-5 w-5" }), t.label]
					}, t.id))
				})
			})
		]
	});
}
//#endregion
export { AdminPage as component };
