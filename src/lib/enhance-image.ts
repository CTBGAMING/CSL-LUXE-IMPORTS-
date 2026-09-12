import { flushSync } from "react-dom";
import { supabase } from "@/integrations/supabase/client";

const TARGET_SIZE = 512;

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = TARGET_SIZE;
        canvas.height = TARGET_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not read that image."));
          return;
        }

        const scale = Math.max(TARGET_SIZE / img.width, TARGET_SIZE / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (TARGET_SIZE - w) / 2;
        const y = (TARGET_SIZE - h) / 2;

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);
        ctx.drawImage(img, x, y, w, h);

        resolve(canvas.toDataURL("image/png", 1.0));
      };
      img.onerror = () => reject(new Error("Could not load image file."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read file data."));
    reader.readAsDataURL(file);
  });
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