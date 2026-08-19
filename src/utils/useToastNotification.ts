/**
 * Hook for managing transient toast notifications with optional undo functionality.
 * Ensures only one toast is visible at a time (last toast wins).
 */
import { useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  title: string;
  intent?: 'success' | 'error' | 'warning';
  actionText?: string;
  actionFn?: () => void;
  timeout?: number; // ms, default 5000
}

export function useToastNotification() {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: ToastMessage) => {
    // Clear previous timeout
    if (timeoutId) clearTimeout(timeoutId);

    // Show new toast
    setToast(message);

    // Auto-dismiss after timeout (default 5000ms)
    const timeout = message.timeout ?? 5000;
    const id = setTimeout(() => {
      setToast(null);
      setTimeoutId(null);
    }, timeout);

    setTimeoutId(id);
  }, [timeoutId]);

  const dismissToast = useCallback(() => {
    if (timeoutId) clearTimeout(timeoutId);
    setToast(null);
    setTimeoutId(null);
  }, [timeoutId]);

  return {
    toast,
    showToast,
    dismissToast,
  };
}
