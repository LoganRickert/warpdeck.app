import { useState, useCallback } from 'react';

interface UseFormStateOptions<T> {
  onSave: (data: T) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  autoHideSuccess?: boolean;
  successHideDelay?: number;
}

interface UseFormStateReturn<T> {
  saving: boolean;
  error: string | null;
  success: boolean;
  handleSave: (data: T) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
}

export function useFormState<T>({
  onSave,
  onSuccess,
  onError,
  autoHideSuccess = true,
  successHideDelay = 3000
}: UseFormStateOptions<T>): UseFormStateReturn<T> {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = useCallback(async (data: T) => {
    try {
      setSaving(true);
      setError(null);
      
      await onSave(data);
      
      setSuccess(true);
      onSuccess?.();
      
      if (autoHideSuccess) {
        setTimeout(() => setSuccess(false), successHideDelay);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [onSave, onSuccess, onError, autoHideSuccess, successHideDelay]);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(false), []);

  return {
    saving,
    error,
    success,
    handleSave,
    clearError,
    clearSuccess
  };
}
