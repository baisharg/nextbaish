"use client";

import { useRef, type ReactNode } from "react";

/**
 * A card that opens a native <dialog> with the full bio. The dialog gives us
 * focus trapping, Escape to close and a backdrop for free; clicking the
 * backdrop closes it too.
 */
export function BioDialog({
  card,
  label,
  closeLabel,
  openLabel,
  children,
}: {
  card: ReactNode;
  /** Accessible name of the dialog, e.g. the person's name */
  label: string;
  closeLabel: string;
  openLabel: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        className="lab-member lab-member-button"
        onClick={() => ref.current?.showModal()}
        aria-haspopup="dialog"
      >
        {card}
        <span className="lab-member-more">
          {openLabel} <span aria-hidden="true">→</span>
        </span>
      </button>
      <dialog
        ref={ref}
        className="lab-dialog"
        aria-label={label}
        onClick={(event) => {
          if (event.target === ref.current) ref.current.close();
        }}
      >
        <div className="lab-dialog-body">
          <form method="dialog">
            <button
              type="submit"
              className="lab-dialog-close"
              aria-label={closeLabel}
            >
              <span aria-hidden="true">×</span>
            </button>
          </form>
          {children}
        </div>
      </dialog>
    </>
  );
}
