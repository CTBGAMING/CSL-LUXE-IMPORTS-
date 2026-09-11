import { useState } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, PREORDER_WINDOWS, type ProductCategory } from "@/lib/products";
import { saveProductCost, type AdminProduct } from "@/lib/backoffice";
import { ImageEnhancer } from "@/components/admin/image-enhancer";


export const inputCls =
  "w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

type ProductFormProps = {
  product: AdminProduct | null;
  onClose: () => void;
  onSaved: () => void;
};

export function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price ? String(product.price) : "");
  const [cost, setCost] = useState(product?.cost_price ? String(product.cost_price) : "");
  const [stockQty, setStockQty] = useState(String(product?.stock_qty ?? 0));
  const [preorder, setPreorder] = useState(product?.preorder ?? false);
  const [preorderEta, setPreorderEta] = useState(
    product?.preorder_eta ?? PREORDER_WINDOWS[1],
  );
  const [category, setCategory] = useState<ProductCategory>(
    (product?.category as ProductCategory) ?? "925 Silver",
  );
  const [file, setFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>(product?.images ?? []);
  const existingSignedGallery = (product?.signed_image_urls ?? []).filter(
    (u) => u !== product?.signed_image_url,
  );
  const [enhancing, setEnhancing] = useState<
    { kind: "main" } | { kind: "gallery"; index: number } | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enhanceTargetFile =
    enhancing?.kind === "main"
      ? file
      : enhancing?.kind === "gallery"
        ? (galleryFiles[enhancing.index] ?? null)
        : null;

  function applyEnhanced(next: File) {
    if (enhancing?.kind === "main") setFile(next);
    else if (enhancing?.kind === "gallery") {
      const idx = enhancing.index;
      setGalleryFiles((prev) => prev.map((f, i) => (i === idx ? next : f)));
    }
    setEnhancing(null);
  }


  const priceNum = Number(price) || 0;
  const costNum = Number(cost) || 0;
  const margin = priceNum > 0 ? ((priceNum - costNum) / priceNum) * 100 : 0;

  async function uploadOne(f: File): Promise<string> {
    const ext = f.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("product-images")
      .upload(path, f, { upsert: false, contentType: f.type });
    if (upErr) throw upErr;
    return path;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      let image_url = product?.image_url ?? null;
      if (file) {
        const newPath = await uploadOne(file);
        if (product?.image_url) {
          await supabase.storage.from("product-images").remove([product.image_url]);
        }
        image_url = newPath;
      }
      const uploadedGallery: string[] = [];
      for (const f of galleryFiles) {
        uploadedGallery.push(await uploadOne(f));
      }
      const finalGallery = [...existingGallery, ...uploadedGallery];
      const removedFromGallery = (product?.images ?? []).filter(
        (p) => !existingGallery.includes(p),
      );
      if (removedFromGallery.length > 0) {
        await supabase.storage.from("product-images").remove(removedFromGallery);
      }
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
        images: finalGallery,
      };
      let productId = product?.id;
      if (product) {
        const { error: err } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id);
        if (err) throw err;
      } else {
        const { data, error: err } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:rounded sm:p-6"
      >
        <h2 className="font-serif text-2xl text-silver-gradient">
          {product ? "Edit product" : "New product"}
        </h2>

        <div className="mt-6 space-y-4">
          <Field label="Name">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Selling price (ZAR)">
              <input
                type="number"
                min={0}
                step="0.01"
                required
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Cost price (ZAR)">
              <input
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
          {priceNum > 0 && (
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Profit per unit:{" "}
              <span className="text-primary">
                R {(priceNum - costNum).toFixed(2)} ({margin.toFixed(0)}%)
              </span>
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className={inputCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Stock quantity">
              <input
                type="number"
                min={0}
                step="1"
                inputMode="numeric"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="rounded border border-border/70 p-3">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={preorder}
                onChange={(e) => setPreorder(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
              />
              <span>
                <span className="text-sm text-foreground">Available for pre-order</span>
                <span className="block text-[11px] text-muted-foreground">
                  Shows on the store even with zero stock, with an arrival window.
                </span>
              </span>
            </label>
            {preorder && (
              <div className="mt-3">
                <Field label="Rough arrival window">
                  <select
                    value={preorderEta ?? ""}
                    onChange={(e) => setPreorderEta(e.target.value)}
                    className={inputCls}
                  >
                    {PREORDER_WINDOWS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
          </div>
          <Field label="Main image">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-xs text-muted-foreground file:mr-3 file:rounded file:border-0 file:bg-primary/20 file:px-3 file:py-1.5 file:text-primary"
            />
            {file && (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="h-20 w-20 rounded object-cover"
                />
                <button
                  type="button"
                  onClick={() => setEnhancing({ kind: "main" })}
                  className="flex items-center gap-2 rounded border border-primary px-3 py-1.5 text-[11px] uppercase tracking-widest text-primary"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Enhance with AI
                </button>
              </div>
            )}
            {product?.signed_image_url && !file && (
              <img
                src={product.signed_image_url}
                alt=""
                className="mt-2 h-20 w-20 rounded object-cover"
              />
            )}
          </Field>

          <Field label="Additional gallery images">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setGalleryFiles(e.target.files ? Array.from(e.target.files) : [])
              }
              className="w-full text-xs text-muted-foreground file:mr-3 file:rounded file:border-0 file:bg-primary/20 file:px-3 file:py-1.5 file:text-primary"
            />
            {existingGallery.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {existingGallery.map((path, idx) => {
                  const url = existingSignedGallery[idx];
                  return (
                    <div key={path} className="relative">
                      {url && (
                        <img src={url} alt="" className="h-16 w-16 rounded object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setExistingGallery((prev) => prev.filter((p) => p !== path))
                        }
                        className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive px-1.5 text-xs text-destructive-foreground"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {galleryFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {galleryFiles.map((f, idx) => (
                  <div key={`${f.name}-${idx}`} className="flex flex-col items-center gap-1">
                    <img
                      src={URL.createObjectURL(f)}
                      alt=""
                      className="h-16 w-16 rounded object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setEnhancing({ kind: "gallery", index: idx })}
                      className="flex items-center gap-1 rounded border border-primary px-2 py-1 text-[9px] uppercase tracking-widest text-primary"
                    >
                      <Sparkles className="h-3 w-3" /> AI
                    </button>
                  </div>
                ))}
              </div>
            )}

          </Field>
        </div>

        {error && (
          <p className="mt-4 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-border px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-gradient-to-r from-primary to-purple-glow px-4 py-2 text-xs font-medium uppercase tracking-widest text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
      {enhancing && enhanceTargetFile && (
        <ImageEnhancer
          file={enhanceTargetFile}
          onCancel={() => setEnhancing(null)}
          onAccept={applyEnhanced}
        />
      )}
    </div>
  );

}
