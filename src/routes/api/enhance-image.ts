import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const BASE_RULES =
  "Professional product photography retouching for a South African jewellery/watch store. " +
  "Keep the exact item unchanged: shape, proportions, engravings, stones, links, dial, hands, " +
  "text and brand marks must stay identical. Only adjust lighting, background, colour balance, " +
  "sharpness and framing. Never add or remove parts of the product.";

function dataUrlToBlob(dataUrl: string): Blob {
  try {
    const parts = dataUrl.split(",");
    if (parts.length < 2) throw new Error("Invalid data url");
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (err) {
    throw new Error("Could not read that image.");
  }
}

export const Route = createFileRoute("/api/enhance-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization") ?? "";
        if (!authHeader.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.slice(7);

        const SUPABASE_URL = process.env["SUPABASE_URL"];
        const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
        const key = process.env["OPENAI_API_KEY"];
        if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
          return new Response("Backend is not configured.", { status: 500 });
        }
        if (!key) return new Response("OpenAI key is not configured.", { status: 500 });

        const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          global: {
            fetch: (input, init) => {
              const headers = new Headers(init?.headers);
              if (headers.get("Authorization") === `Bearer ${SUPABASE_PUBLISHABLE_KEY}`) {
                headers.delete("Authorization");
              }
              headers.set("apikey", SUPABASE_PUBLISHABLE_KEY);
              headers.set("Authorization", `Bearer ${token}`);
              return fetch(input, { ...init, headers });
            },
          },
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
        const userId = claims?.claims?.sub;
        if (claimsError || !userId) return new Response("Unauthorized", { status: 401 });

        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);
        if (!roles?.some((r) => r.role === "admin")) {
          return new Response("Admin access required", { status: 403 });
        }

        const body = (await request.json()) as { dataUrl?: string; instruction?: string };
        const dataUrl = body.dataUrl ?? "";
        const instruction = (body.instruction ?? "").slice(0, 1000);

        if (!dataUrl.includes("base64")) {
          return new Response("That file isn't a readable image — try a JPG or PNG.", {
            status: 400,
          });
        }

        let imageBlob: Blob;
        try {
          imageBlob = dataUrlToBlob(dataUrl);
        } catch {
          return new Response("Could not read that image.", { status: 400 });
        }

        const form = new FormData();
        form.append("model", "gpt-image-1");
        form.append("image", imageBlob, "source.png");
        form.append("prompt", `${BASE_RULES}\n\nRetouch instruction: ${instruction}`);
        form.append("n", "1");
        form.append("size", "1024x1024");

        const upstream = await fetch("https://api.openai.com/v1/images/edits", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: form,
        });

        if (!upstream.ok) {
          const detail = await upstream.text().catch(() => "");
          let errorText = "Enhance failed — try again.";
          try {
            const parsed = JSON.parse(detail) as { error?: { code?: string; message?: string } };
            const code = parsed.error?.code ?? "";
            const message = parsed.error?.message ?? "";
            if (upstream.status === 401 || code === "invalid_api_key") {
              errorText = "OpenAI key is invalid — check settings.";
            } else if (code === "insufficient_quota") {
              errorText = "OpenAI account is out of credits.";
            } else if (upstream.status === 429 || code === "rate_limit_exceeded") {
              errorText = "OpenAI is busy — wait a moment and try again.";
            } else if (message) {
              errorText = message;
            }
          } catch {
            if (upstream.status === 401) errorText = "OpenAI key is invalid.";
          }
          console.error("enhance-image failed", upstream.status, detail.slice(0, 500));
          return new Response(errorText, { status: upstream.status });
        }

        const data = await upstream.json();
        return Response.json(data);
      },
    },
  },
});