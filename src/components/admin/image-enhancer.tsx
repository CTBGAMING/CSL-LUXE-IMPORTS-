import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { enhanceImage, fileToDataUrl, dataUrlToFile } from "@/lib/enhance-image";

const PRESETS = [
  {
    id: "studio",
    label: "Clean studio white",
    prompt:
      "Place the item on a seamless pure white studio background with soft, even light, gentle natural shadow beneath it, and crisp detail.",
  },
  {
    id: "luxe",
    label: "Luxe black",
    prompt:
      "Place the item on a dark reflective black surface with dramatic soft key light and a subtle reflection, luxury jewellery advertising style.",
  },
  {
    id: "brighten",
    label: "Brighten & sharpen",
    prompt:
      "Keep the existing background. Fix exposure, white balance and colour, remove noise, and sharpen the item so it looks professionally photographed.",
  },
  {
    id: "cutout",
    label: "Remove background",
    prompt:
      "Remove the background completely and place the item alone on a plain flat white backdrop, centred, with a soft contact shadow.",
  },
] as const;

type Props = {
  file: File;
  onCancel: () => void;
  onAccept: (file: File) => void;
};

export function ImageEnhancer({ file, onCancel, onAccept }: Props) {
  const [originalUrl] = useState(() => URL.createObjectURL(file));
  const [preset, setPreset] = useState<string>(PRESETS[0].id);
  const [extra, setExtra] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    setIsFinal(false);
    try {
      const base = PRESETS.find((p) => p.id === preset)?.prompt ?? "";
      const instruction = [base, extra.trim()].filter(Boolean).join(" ");
      const src = await fileToDataUrl(file);
      await enhanceImage(src, instruction, (url, final) => {
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

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:rounded sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl text-silver-gradient">AI photo studio</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Restyles lighting and background only — the item itself stays exactly as photographed.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-border p-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Original</p>
            <img
              src={originalUrl}
              alt="Original"
              className="mt-1 aspect-square w-full rounded object-cover"
            />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Enhanced</p>
            <div className="mt-1 flex aspect-square w-full items-center justify-center overflow-hidden rounded border border-dashed border-border bg-background/60">
              {result ? (
                <img
                  src={result}
                  alt="Enhanced"
                  className={`h-full w-full object-cover transition-[filter] duration-500 ${
                    isFinal ? "blur-0" : "blur-xl"
                  }`}
                />
              ) : (
                <span className="px-4 text-center text-xs text-muted-foreground">
                  {busy ? "Working on it…" : "Pick a look and tap Enhance"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset(p.id)}
              className={`rounded border px-3 py-1.5 text-[11px] uppercase tracking-widest transition ${
                preset === p.id
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <textarea
          rows={2}
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          placeholder="Optional extra instruction, e.g. show it on a marble slab"
          className="mt-3 w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />

        {error && (
          <p className="mt-3 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-border px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void run()}
            disabled={busy}
            className="flex items-center gap-2 rounded border border-primary px-4 py-2 text-xs uppercase tracking-widest text-primary disabled:opacity-60"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {busy ? "Enhancing…" : result ? "Re-run" : "Enhance"}
          </button>
          <button
            type="button"
            onClick={() => void accept()}
            disabled={!result || !isFinal || busy}
            className="rounded bg-gradient-to-r from-primary to-purple-glow px-4 py-2 text-xs font-medium uppercase tracking-widest text-primary-foreground disabled:opacity-40"
          >
            Use this image
          </button>
        </div>
      </div>
    </div>
  );
}
