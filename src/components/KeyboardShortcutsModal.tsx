import { useState } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  Button,
  TabList,
  Tab,
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
  const [activeTab, setActiveTab] = useState<'overview' | 'shortcuts'>('overview');

  return (
    <Dialog open={open} onOpenChange={(_e, data) => { if (!data.open) onClose(); }}>
      <DialogSurface
        backdrop={{ style: { backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' } }}
        style={{ minWidth: '500px', maxWidth: '740px', width: 'min(90vw, 740px)' }}
      >
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
          Help
        </DialogTitle>
        <DialogBody>
          <DialogContent>
            <TabList
              selectedValue={activeTab}
              onTabSelect={(_e, data) => setActiveTab(data.value as 'overview' | 'shortcuts')}
              appearance="subtle"
              className="shortcut-tabs"
            >
              <Tab value="overview">What is this</Tab>
              <Tab value="shortcuts">Keyboard shortcuts</Tab>
            </TabList>

            {activeTab === 'overview' ? (
              <div className="help-panel help-panel--overview">
                <span className="help-panel__eyebrow">Welcome to Evergreen Workbench</span>
                <h3 className="help-panel__title">Track the latest app versions with confidence.</h3>
                <p className="help-panel__copy">
                  Browse the catalog, pin the apps you care about, and jump straight to the
                  version history you need.
                </p>

                <div className="help-panel__steps" aria-label="Onboarding steps">
                  <div className="help-panel__step">
                    <span className="help-panel__index">1</span>
                    <div>
                      <strong>Pin apps</strong>
                      <small>Keep your most important workloads at the top.</small>
                    </div>
                  </div>
                  <div className="help-panel__step">
                    <span className="help-panel__index">2</span>
                    <div>
                      <strong>Filter and sort</strong>
                      <small>Focus on recent updates and the app details that matter most.</small>
                    </div>
                  </div>
                  <div className="help-panel__step">
                    <span className="help-panel__index">3</span>
                    <div>
                      <strong>Press / to search</strong>
                      <small>Find any app instantly and start from the first relevant result.</small>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="help-panel help-panel--shortcuts">
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
            )}
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
