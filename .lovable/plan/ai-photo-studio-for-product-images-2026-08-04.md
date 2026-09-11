# AI photo studio for product images

Add an "Enhance with AI" step to the admin product form so supplier photos or phone snaps can be cleaned up into listing-quality images before they're saved.

## How it works for you

1. In the product form, pick a photo (main image or gallery).
2. Tap **Enhance with AI**. A small panel opens showing the original.
3. Choose a preset look, or type your own instruction:
   - Clean studio white — item on seamless white, soft even light
   - Luxe black — dark reflective surface, matching the CSL Luxe site aesthetic
   - Brighten & sharpen — keep the background, just fix lighting, colour and clarity
   - Remove background — subject only, plain backdrop
4. The edited version appears next to the original. You can re-run, tweak the instruction, or keep the original.
5. **Use this image** attaches the enhanced photo to the product; saving uploads it to storage like any other image.

The AI only restyles lighting/background/clarity — the prompt explicitly forbids changing the actual item (shape, engraving, stones, brand marks), so listings stay honest.

## About your OpenAI key

Not needed. Image editing runs through the AI that's already built into this project (billed with your existing Lovable AI usage), so there's no extra key to manage or leak. If you'd rather route it through your own OpenAI account later, that's a small swap we can make at any time — say the word and I'll add it as a setting.

## Technical notes

- New server route `src/routes/api/enhance-image.ts` (a route, not a server function, so the image can stream back progressively). It verifies the caller is an admin, then POSTs to the Lovable AI Gateway `/v1/images/generations` with `google/gemini-3.1-flash-image` using the chat body shape (`messages` with a text part plus the source `image_url` data URL, `modalities: ["image","text"]`, `stream: true`).
- New `src/lib/enhance-image.ts` client helper: converts the chosen `File` to a data URL, POSTs to the route, parses the SSE frames with `eventsource-parser` + `flushSync`, renders partial frames blurred and the final frame sharp.
- New `src/components/admin/image-enhancer.tsx`: modal with original/result side by side, preset buttons, free-text instruction, Re-run, Use this image, Cancel. Mobile-first layout (stacked on small screens) to match the rest of the back office.
- `src/components/admin/product-form.tsx`: add an Enhance button next to the main-image and gallery file inputs. The accepted result is converted back to a `File` and flows through the existing `uploadOne` upload path — no schema or storage changes.
- Errors surfaced plainly: 429 "AI is busy", 402 "AI credits used up", moderation/other failures show the gateway message.
- Source images are downscaled client-side (max ~1600px) before upload to keep requests fast.

## Not included

- Batch enhancing many products at once.
- Storing "original vs enhanced" history — only the image you accept is saved.
