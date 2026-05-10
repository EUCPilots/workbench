import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  Button,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutModal({ open, onClose }: AboutModalProps) {
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
          About Evergreen
        </DialogTitle>
        <DialogBody>
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
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
