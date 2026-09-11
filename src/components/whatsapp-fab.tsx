const WHATSAPP_NUMBER = "27710325294";
const DEFAULT_MESSAGE = "Hi CSL Luxe, I'd like to chat about your pieces.";

export function WhatsAppFab() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
  return (
    <a
      href={href}
      target="_top"
      rel="noopener noreferrer"
      aria-label="Chat to us on WhatsApp"
      className="group fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-border/60 bg-gradient-to-br from-[#25D366] to-[#128C7E] px-4 py-3 text-sm font-medium text-white shadow-2xl shadow-black/40 transition hover:scale-105 hover:shadow-primary/40 sm:bottom-8 sm:right-8"
    >
      <WhatsAppIcon />
      <span className="hidden text-xs uppercase tracking-widest sm:inline">
        Chat to us
      </span>
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M19.11 17.28c-.28-.14-1.66-.82-1.91-.91-.26-.09-.44-.14-.63.14-.18.28-.72.91-.88 1.1-.16.19-.32.21-.6.07-.28-.14-1.18-.44-2.25-1.39-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.19-.28.28-.46.09-.19.05-.35-.02-.49-.07-.14-.63-1.51-.86-2.07-.23-.54-.46-.47-.63-.48h-.54c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.34s1 2.71 1.14 2.9c.14.19 1.97 3.01 4.78 4.22.67.29 1.19.46 1.59.59.67.21 1.28.18 1.76.11.54-.08 1.66-.68 1.89-1.34.23-.66.23-1.22.16-1.34-.07-.12-.26-.19-.54-.33zM16.02 4C9.4 4 4.03 9.37 4.03 15.98c0 2.11.55 4.17 1.6 5.98L4 28l6.2-1.62a11.94 11.94 0 0 0 5.82 1.48h.01c6.62 0 11.99-5.37 11.99-11.98S22.64 4 16.02 4zm0 21.86h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.68.96.98-3.58-.24-.37a9.86 9.86 0 0 1-1.52-5.28c0-5.46 4.44-9.9 9.88-9.9 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.46-4.44 9.87-9.89 9.87z"/>
    </svg>
  );
}
