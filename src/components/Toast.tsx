/**
 * Toast Notification Component
 * Displays a dismissible toast with optional action button and auto-timeout.
 * Uses Fluent UI toast primitives for consistent theming and readable contrast.
 */
import { useEffect } from 'react';
import {
  Toaster,
  Toast as FluentToast,
  ToastBody,
  ToastTitle,
  useToastController,
} from '@fluentui/react-components';
import '../styles/toast.css';
import type { ToastMessage } from '../utils/useToastNotification';

interface ToastProps {
  message: ToastMessage | null;
  onDismiss: () => void;
}

function AppToast({ message, onDismiss }: ToastProps) {
  const toasterId = 'workbench-toast';
  const { dispatchToast, dismissAllToasts } = useToastController(toasterId);

  useEffect(() => {
    if (!message) {
      dismissAllToasts();
      return;
    }

    dismissAllToasts();
    dispatchToast(
      <FluentToast>
        <ToastBody>
          <ToastTitle>{message.title}</ToastTitle>
        </ToastBody>
      </FluentToast>,
      {
        toastId: message.id,
        intent: message.intent ?? 'success',
        position: 'bottom-end',
        timeout: message.timeout ?? 5000,
        pauseOnHover: true,
        pauseOnWindowBlur: true,
        priority: 100,
        root: {
          className: `toast toast--${message.intent ?? 'success'}`,
        },
      },
    );
  }, [dismissAllToasts, dispatchToast, message, onDismiss]);

  return <Toaster toasterId={toasterId} position="bottom-end" />;
}

export default AppToast;
