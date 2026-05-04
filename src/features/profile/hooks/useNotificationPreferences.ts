import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { profileService } from '../api/profile.api';
import { PROFILE_QUERY_KEYS } from './userProfile';
import type { NotificationPreferences } from '../types/profile.type';

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  bookingApproved: true,
  bookingRejected: true,
  bookingReminder: true,
};

export interface UseNotificationPreferencesOptions {
  initialPreferences?: NotificationPreferences | null;
  onSaved?: (preferences: NotificationPreferences) => void;
}

export const useNotificationPreferences = (
  options: UseNotificationPreferencesOptions = {},
) => {
  const queryClient = useQueryClient();
  const { initialPreferences, onSaved } = options;

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(
    initialPreferences ?? DEFAULT_NOTIFICATION_PREFERENCES,
  );
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    if (!initialPreferences) return;

    setNotificationPrefs(initialPreferences);
    hasInitializedRef.current = true;
  }, [initialPreferences]);

  const updateNotificationPref = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K],
  ) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetMessages = () => {
    setSaveError(null);
    setSaveSuccess(null);
  };

  const saveNotificationPreferences = async () => {
    resetMessages();
    setIsSavingPreferences(true);

    try {
      const savedPayload = { ...notificationPrefs };
      const updated = await profileService.updateNotificationPreferences(savedPayload);

      setNotificationPrefs(updated);
      queryClient.setQueryData([PROFILE_QUERY_KEYS.ME], (current: unknown) => {
        if (!current || typeof current !== 'object') return current;

        return {
          ...(current as Record<string, unknown>),
          notificationPreferences: updated,
        };
      });

      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEYS.ME] });

      setSaveSuccess('Preferences saved successfully');
      onSaved?.(updated);
      return updated;
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const status = (error as { response?: { status?: number } }).response?.status;
        if (status === 401) setSaveError('Bạn cần đăng nhập lại');
        else if (status === 400) setSaveError('Dữ liệu không hợp lệ');
        else if (status === 500) setSaveError('Có lỗi xảy ra, vui lòng thử lại sau');
        else setSaveError('Failed to save preferences');
      } else {
        setSaveError('Failed to save preferences');
      }
      throw error;
    } finally {
      setIsSavingPreferences(false);
    }
  };

  return {
    notificationPrefs,
    updateNotificationPref,
    isSavingPreferences,
    saveError,
    saveSuccess,
    saveNotificationPreferences,
    resetMessages,
  };
};
