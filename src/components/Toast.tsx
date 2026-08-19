/**
 * Toast Notification Component
 * Displays a dismissible toast with optional action button and auto-timeout.
 * Uses Fluent UI styling for consistency.
 */
import { Button } from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import '../styles/toast.css';
import type { ToastMessage } from '../utils/useToastNotification';

interface ToastProps {
  message: ToastMessage | null;
  onDismiss: () => void;
}

function Toast({ message, onDismiss }: ToastProps) {
  if (!message) return null;

  const intentClass = message.intent ? `toast--${message.intent}` : 'toast--success';

  return (
    <div className={`toast ${intentClass}`} role="status" aria-live="polite">
      <span className="toast__message">{message.title}</span>
      <div className="toast__actions">
        {message.actionFn && message.actionText && (
          <Button
            appearance="transparent"
            size="small"
            onClick={message.actionFn}
            className="toast__action-btn"
          >
            {message.actionText}
          </Button>
        )}
        <Button
          appearance="transparent"
          size="small"
          icon={<DismissRegular />}
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="toast__close-btn"
        />
      </div>
    </div>
  );
}

export default Toast;
