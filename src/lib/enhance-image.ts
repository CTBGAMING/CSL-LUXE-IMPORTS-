import { createParser } from "eventsource-parser";
import { flushSync } from "react-dom";
import { supabase } from "@/integrations/supabase/client";

const MAX_DIM = 1600;

export async function fileToDataUrl(file: File): Promise<string> {
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
  return canvas.toDataURL("image/jpeg", 0.92);
}

export async function dataUrlToFile(dataUrl: string, name: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const ext = blob.type.includes("png") ? "png" : "jpg";
  return new File([blob], `${name}.${ext}`, { type: blob.type || "image/png" });
}

type Payload =
  | { type: "image_edit.partial_image"; b64_json: string }
  | { type: "image_edit.completed"; b64_json: string }
  | { type: "error"; error: { message?: string } };

async function postEnhance(dataUrl: string, instruction: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Your session expired — sign in again.");

  const res = await fetch("/api/enhance-image", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ dataUrl, instruction }),
  });
  if (!res.ok || !res.body) {
    throw new Error((await res.text().catch(() => "")) || `Enhance failed (${res.status})`);
  }
  return res.body;
}

async function parseStream(
  body: ReadableStream<Uint8Array>,
  onFrame: (dataUrl: string, isFinal: boolean) => void,
): Promise<boolean> {
  let sawCompleted = false;
  let streamError: string | undefined;

  const parser = createParser({
    onEvent(event) {
      let payload: Payload | undefined;
      try {
        payload = JSON.parse(event.data) as Payload;
      } catch {
        return;
      }
      if (event.event === "error" || payload?.type === "error") {
        streamError =
          (payload as { error?: { message?: string } })?.error?.message ?? "Enhance failed";
        return;
      }
      if (
        event.event !== "image_edit.partial_image" &&
        event.event !== "image_edit.completed"
      )
        return;
      const b64 = (payload as { b64_json?: string }).b64_json;
      if (!b64) return;
      const isFinal = event.event === "image_edit.completed";
      flushSync(() => onFrame(`data:image/png;base64,${b64}`, isFinal));
      if (isFinal) sawCompleted = true;
    },
  });

  const reader = body.pipeThrough(
    new TextDecoderStream() as unknown as ReadableWritablePair<string, Uint8Array>,
  ).getReader();
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

async function fetchNonStreaming(
  dataUrl: string,
  instruction: string,
  onFrame: (dataUrl: string, isFinal: boolean) => void,
) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Your session expired — sign in again.");

  const res = await fetch("/api/enhance-image", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ dataUrl, instruction }),
  });
  if (!res.ok) {
    throw new Error((await res.text().catch(() => "")) || `Enhance failed (${res.status})`);
  }
  const json = (await res.json()) as {
    data?: { b64_json?: string }[];
  };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error("The AI didn't return an image — try again.");
  flushSync(() => onFrame(`data:image/png;base64,${b64}`, true));
}

export async function enhanceImage(
  dataUrl: string,
  instruction: string,
  onFrame: (dataUrl: string, isFinal: boolean) => void,
): Promise<void> {
  const body = await postEnhance(dataUrl, instruction);
  const sawCompleted = await parseStream(body, onFrame);
  if (!sawCompleted) {
    // OpenAI sometimes returns no partial frames; fall back to a single non-streamed request.
    await fetchNonStreaming(dataUrl, instruction, onFrame);
  }
}
