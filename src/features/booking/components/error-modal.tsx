'use client';

import { useEffect, useRef } from 'react';

type Props = {
  message: string;
  ticketId: string;
  onClose: () => void;
};

export function ErrorModal({ message, ticketId, onClose }: Props) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!message) return undefined;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const controls = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = controls.item(0);
      const last = controls.item(controls.length - 1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="error-modal-backdrop">
      <section
        ref={dialogRef}
        className="error-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="error-modal-title"
        aria-describedby="error-modal-message"
        tabIndex={-1}
      >
        <span className="error-modal-icon" aria-hidden="true">
          !
        </span>
        <h2 id="error-modal-title">We couldn’t complete that</h2>
        <p id="error-modal-message">{message}</p>
        {ticketId && (
          <p className="error-modal-ticket">
            Ticket ID: <code>{ticketId}</code>
          </p>
        )}
        <button ref={closeButtonRef} className="primary" type="button" onClick={onClose}>
          Close
        </button>
      </section>
    </div>
  );
}
