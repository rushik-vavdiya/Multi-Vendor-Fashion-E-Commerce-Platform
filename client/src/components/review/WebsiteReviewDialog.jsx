import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import WebsiteReviewForm from './WebsiteReviewForm';

// The review form, shown as a popup instead of sitting open on the page. The
// form component itself is untouched: it is the same card that used to be pinned
// beside the review list, including its "sign in to review" state.
export default function WebsiteReviewDialog({ open, onClose, triggerRef = null }) {
  const panelRef = useRef(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      // Keyboard goes back to the button that opened the popup, not to the top of
      // the document. Skipped on first render, when nothing was open yet.
      if (wasOpen.current) {
        wasOpen.current = false;
        triggerRef?.current?.focus();
      }
      return undefined;
    }

    wasOpen.current = true;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    // A popup over a page that still scrolls behind it is a trap for anyone on a
    // touchpad, so the page is held still while it is open.
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open, onClose, triggerRef]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close review form"
        onClick={onClose}
        className="fixed inset-0 h-full w-full cursor-default bg-scrim/55 backdrop-blur-[2px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Write a review of our website"
        tabIndex={-1}
        className="relative z-10 w-full max-w-lg animate-pop outline-none"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close review form"
          className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-full border border-border bg-background text-primary transition-colors hover:border-accent hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X className="size-4" strokeWidth={2} aria-hidden="true" />
        </button>

        <WebsiteReviewForm />
      </div>
    </div>,
    document.body,
  );
}
