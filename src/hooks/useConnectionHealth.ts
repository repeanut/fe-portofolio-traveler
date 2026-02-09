import { useEffect, useRef } from 'react';

export const useConnectionHealth = (url: string, checkInterval: number = 30000) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isOnlineRef = useRef<boolean>(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          cache: 'no-cache'
        });

        clearTimeout(timeoutId);

        if (response.ok || response.status === 404) {
          if (!isOnlineRef.current) {
            console.log('🟢 Backend connection restored');
            isOnlineRef.current = true;
          }
        } else {
          throw new Error(`Server responded with ${response.status}`);
        }
      } catch (error) {
        if (isOnlineRef.current) {
          console.warn('🔴 Backend connection lost:', error instanceof Error ? error.message : 'Unknown error');
          isOnlineRef.current = false;
        }
      }
    };

    // Initial check
    checkConnection();

    // Set up periodic checks
    intervalRef.current = setInterval(checkConnection, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [url, checkInterval]);

  const isOnline = () => isOnlineRef.current;

  return { isOnline };
};
