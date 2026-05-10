import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  Button,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';

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
  open: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={(_e, data) => { if (!data.open) onClose(); }}>
      <DialogSurface>
        <DialogTitle
          action={
            <Button
              appearance="subtle"
              icon={<DismissRegular />}
              onClick={onClose}
              aria-label="Close"
            />
          }
        >
          Keyboard shortcuts
        </DialogTitle>
        <DialogBody>
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
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
