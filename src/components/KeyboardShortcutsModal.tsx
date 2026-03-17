import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ShortcutRow {
  keys: string[];
  description: string;
}

const SHORTCUTS: ShortcutRow[] = [
  { keys: ['Ctrl', 'K'], description: 'Open global search' },
  { keys: ['/'], description: 'Focus sidebar search (Apps tab)' },
  { keys: ['↑', '↓'], description: 'Navigate app list (Apps tab)' },
  { keys: ['Esc'], description: 'Close search or modal' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
];

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
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
      aria-label="Keyboard shortcuts"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={modalRef} className="shortcuts-modal" tabIndex={-1}>
        <div className="shortcuts-modal__header">
          <h2 className="shortcuts-modal__title">Keyboard shortcuts</h2>
          <button className="shortcuts-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <table className="shortcuts-table">
          <tbody>
            {SHORTCUTS.map((row, i) => (
              <tr key={i}>
                <td className="shortcuts-table__keys">
                  {row.keys.map((k, j) => (
                    <span key={j}>
                      <kbd className="kbd">{k}</kbd>
                      {j < row.keys.length - 1 && <span className="shortcuts-table__plus"> + </span>}
                    </span>
                  ))}
                </td>
                <td className="shortcuts-table__desc">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>,
    document.body
  );
}
