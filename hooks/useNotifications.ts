import { useState, useEffect, useCallback } from 'react';

interface NotificationHook {
  permission: NotificationPermission;
  requestPermission: () => Promise<void>;
  isSupported: boolean;
  error: string | null;
}

const useNotifications = (): NotificationHook => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return;
    try {
      const newPermission = await Notification.requestPermission();
      setPermission(newPermission);
      if (newPermission !== 'granted') {
        setError('알림 권한이 거부되었습니다.');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      setError('알림 권한을 요청하는 중 오류가 발생했습니다.');
    }
  }, [isSupported]);

  return { isSupported, permission, requestPermission, error };
};

export default useNotifications;