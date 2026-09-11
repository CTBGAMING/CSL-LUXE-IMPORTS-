import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const itemSchema = z.object({
  description: z.string().default(""),
  quantity: z.coerce.number().default(1),
  unit_cost: z.coerce.number().default(0),
});

const receiptSchema = z.object({
  supplier: z.string().nullish().transform((v) => v ?? null),
  reference: z.string().nullish().transform((v) => v ?? null),
  order_date: z.string().nullish().transform((v) => v ?? null),
  shipping_cost: z.coerce.number().nullish().transform((v) => v ?? null),
  notes: z.string().nullish().transform((v) => v ?? null),
  items: z.array(itemSchema).default([]),
});

export type ScannedReceipt = z.infer<typeof receiptSchema>;

const PROMPT =
  "You are reading a purchase receipt, invoice or order screenshot for a South African jewellery importer. " +
  "Extract the supplier/store name, any order or invoice reference, the order date as YYYY-MM-DD, " +
  "any shipping or delivery cost, and every purchased line item with its description, quantity and unit cost. " +
  "All money values must be plain numbers with no currency symbol, thousands separator or text. " +
  "If a line shows only a line total, divide it by the quantity. Do not include shipping as a line item. " +
  "Use null for anything you cannot read and never invent items. " +
  'Reply with json only, in exactly this shape: {"supplier":string|null,"reference":string|null,' +
  '"order_date":string|null,"shipping_cost":number|null,"notes":string|null,' +
  '"items":[{"description":string,"quantity":number,"unit_cost":number}]}';

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("The AI reply could not be read.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function mapOpenAiError(status: number, detail: string): string {
  try {
    const parsed = JSON.parse(detail) as { error?: { code?: string; message?: string } };
    const code = parsed.error?.code ?? "";
    const message = parsed.error?.message ?? "";
    if (status === 401 || code === "invalid_api_key") {
      return "OpenAI key is invalid — check the key in settings.";
    }
    if (code === "insufficient_quota") {
      return "OpenAI account is out of credits — add more at platform.openai.com.";
    }
    if (status === 429 || code === "rate_limit_exceeded") {
      return "OpenAI is busy right now — wait a moment and scan again.";
    }
    if (message) return message;
  } catch {
    if (status === 401) return "OpenAI key is invalid.";
    if (status === 429) return "OpenAI is busy right now — wait a moment and scan again.";
  }
  return `Scan failed (${status}). Try a clearer or smaller image.`;
}

export const scanReceipt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { dataUrl: string }) =>
    z.object({ dataUrl: z.string().min(32) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<ScannedReceipt> => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (!roles?.some((r) => r.role === "admin")) {
      throw new Error("Admin access required");
    }

    const key = process.env["OPENAI_API_KEY"];
    if (!key) throw new Error("OpenAI key is not configured on this project.");

    if (!/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(data.dataUrl)) {
      throw new Error("That file isn't a readable image — try a JPG or PNG screenshot.");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              { type: "image_url", image_url: { url: data.dataUrl } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("receipt scan failed", response.status, detail.slice(0, 500));
      throw new Error(mapOpenAiError(response.status, detail));
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = payload.choices?.[0]?.message?.content ?? "";
    if (!text.trim()) throw new Error("The AI couldn't read anything from that image.");

    return receiptSchema.parse(extractJson(text));
  });
