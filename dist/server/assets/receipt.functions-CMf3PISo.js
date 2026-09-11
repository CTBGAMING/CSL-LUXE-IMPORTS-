import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./server-0Tno1-Yx.js";
import { t as requireSupabaseAuth } from "./auth-middleware-DCQYv7tD.js";
import { z } from "zod";
//#region node_modules/@tanstack/start-server-core/dist/esm/createServerRpc.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
//#region src/lib/receipt.functions.ts?tss-serverfn-split
var itemSchema = z.object({
	description: z.string().default(""),
	quantity: z.coerce.number().default(1),
	unit_cost: z.coerce.number().default(0)
});
var receiptSchema = z.object({
	supplier: z.string().nullish().transform((v) => v ?? null),
	reference: z.string().nullish().transform((v) => v ?? null),
	order_date: z.string().nullish().transform((v) => v ?? null),
	shipping_cost: z.coerce.number().nullish().transform((v) => v ?? null),
	notes: z.string().nullish().transform((v) => v ?? null),
	items: z.array(itemSchema).default([])
});
var PROMPT = "You are reading a purchase receipt, invoice or order screenshot for a South African jewellery importer. Extract the supplier/store name, any order or invoice reference, the order date as YYYY-MM-DD, any shipping or delivery cost, and every purchased line item with its description, quantity and unit cost. All money values must be plain numbers with no currency symbol, thousands separator or text. If a line shows only a line total, divide it by the quantity. Do not include shipping as a line item. Use null for anything you cannot read and never invent items. Reply with json only, in exactly this shape: {\"supplier\":string|null,\"reference\":string|null,\"order_date\":string|null,\"shipping_cost\":number|null,\"notes\":string|null,\"items\":[{\"description\":string,\"quantity\":number,\"unit_cost\":number}]}";
function extractJson(text) {
	const cleaned = text.replace(/```(?:json)?/gi, "").trim();
	const start = cleaned.indexOf("{");
	const end = cleaned.lastIndexOf("}");
	if (start === -1 || end <= start) throw new Error("The AI reply could not be read.");
	return JSON.parse(cleaned.slice(start, end + 1));
}
function mapOpenAiError(status, detail) {
	try {
		const parsed = JSON.parse(detail);
		const code = parsed.error?.code ?? "";
		const message = parsed.error?.message ?? "";
		if (status === 401 || code === "invalid_api_key") return "OpenAI key is invalid — check the key in settings.";
		if (code === "insufficient_quota") return "OpenAI account is out of credits — add more at platform.openai.com.";
		if (status === 429 || code === "rate_limit_exceeded") return "OpenAI is busy right now — wait a moment and scan again.";
		if (message) return message;
	} catch {
		if (status === 401) return "OpenAI key is invalid.";
		if (status === 429) return "OpenAI is busy right now — wait a moment and scan again.";
	}
	return `Scan failed (${status}). Try a clearer or smaller image.`;
}
var scanReceipt_createServerFn_handler = createServerRpc({
	id: "e23f739052537814819c58cf9d299e571b86705b2488cbafb60f4c6802d3de9b",
	name: "scanReceipt",
	filename: "src/lib/receipt.functions.ts"
}, (opts) => scanReceipt.__executeServer(opts));
var scanReceipt = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({ dataUrl: z.string().min(32) }).parse(input)).handler(scanReceipt_createServerFn_handler, async ({ data, context }) => {
	const { data: roles } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
	if (!roles?.some((r) => r.role === "admin")) throw new Error("Admin access required");
	const key = process.env["OPENAI_API_KEY"];
	if (!key) throw new Error("OpenAI key is not configured on this project.");
	if (!/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(data.dataUrl)) throw new Error("That file isn't a readable image — try a JPG or PNG screenshot.");
	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`
		},
		body: JSON.stringify({
			model: "gpt-4o-mini",
			response_format: { type: "json_object" },
			messages: [{
				role: "user",
				content: [{
					type: "text",
					text: PROMPT
				}, {
					type: "image_url",
					image_url: { url: data.dataUrl }
				}]
			}]
		})
	});
	if (!response.ok) {
		const detail = await response.text().catch(() => "");
		console.error("receipt scan failed", response.status, detail.slice(0, 500));
		throw new Error(mapOpenAiError(response.status, detail));
	}
	const text = (await response.json()).choices?.[0]?.message?.content ?? "";
	if (!text.trim()) throw new Error("The AI couldn't read anything from that image.");
	return receiptSchema.parse(extractJson(text));
});
//#endregion
export { scanReceipt_createServerFn_handler };
