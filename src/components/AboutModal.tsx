import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface AboutModalProps {
  onClose: () => void;
}

export default function AboutModal({ onClose }: AboutModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="shortcuts-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="About Evergreen"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={modalRef} className="shortcuts-modal about-modal" tabIndex={-1}>
        <div className="shortcuts-modal__header">
          <h2 className="shortcuts-modal__title">About Evergreen</h2>
          <button className="shortcuts-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="about-modal__body">
          <img
            src="/workbench/assets/images/evergreenbulb.png"
            alt="Evergreen logo"
            className="about-modal__logo"
          />
          <p className="about-modal__text">
            Enterprise automation for Windows apps and image management with the latest version and
            downloads for common Windows applications via PowerShell. Discover more{' '}
            <a href="https://eucpilots.com/evergreen/about" target="_blank" rel="noopener noreferrer">
              about Evergreen here
            </a>
            .
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
