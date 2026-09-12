import { flushSync } from "react-dom";
import { supabase } from "@/integrations/supabase/client";

const TARGET_SIZE = 512;

export async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = TARGET_SIZE;
  canvas.height = TARGET_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that image.");

  const scale = Math.max(TARGET_SIZE / bitmap.width, TARGET_SIZE / bitmap.height);
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;
  const x = (TARGET_SIZE - w) / 2;
  const y = (TARGET_SIZE - h) / 2;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);
  ctx.drawImage(bitmap, x, y, w, h);
  bitmap.close();
  
  return canvas.toDataURL("image/png", 1.0);
}

export async function dataUrlToFile(dataUrl: string, name: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const ext = blob.type.includes("png") ? "png" : "jpg";
  return new File([blob], `${name}.${ext}`, { type: blob.type || "image/png" });
}

export async function enhanceImage(
  dataUrl: string,
  instruction: string,
  onFrame: (dataUrl: string, isFinal: boolean) => void,
): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Your session expired — sign in again.");

  const res = await fetch("/api/enhance-image", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ dataUrl, instruction }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(errorText || `Enhance failed (${res.status})`);
  }

  const json = (await res.json()) as {
    data?: { b64_json?: string }[];
  };

  const b64 = json.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("The AI didn't return an image — try again.");
  }

  flushSync(() => {
    onFrame(`data:image/png;base64,${b64}`, true);
  });
}