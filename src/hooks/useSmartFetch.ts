import { useState, useEffect, useCallback } from 'react';

interface FetchOptions {
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
}

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useSmartFetch = <T = any>(url: string, options: FetchOptions = {}) => {
  const {
    retryCount = 3,
    retryDelay = 1000,
    timeout = 10000
  } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const [isMounted, setIsMounted] = useState(true);
  const [retryAttempts, setRetryAttempts] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  const fetchData = useCallback(async (customUrl?: string) => {
    const targetUrl = customUrl || url;
    
    if (!isMounted) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (isMounted) {
        setState({
          data: result,
          loading: false,
          error: null
        });
        setRetryAttempts(0);
      }
    } catch (error: any) {
      if (!isMounted) return;

      console.error(`Fetch error for ${targetUrl}:`, error);

      if (error.name === 'AbortError') {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Request timeout'
          }));
        }
        return;
      }

      // Retry logic
      if (retryAttempts < retryCount) {
        setRetryAttempts(prev => prev + 1);
        
        setTimeout(() => {
          if (isMounted) {
            fetchData(targetUrl);
          }
        }, retryDelay * Math.pow(2, retryAttempts)); // Exponential backoff
      } else {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error.message || 'Failed to fetch data'
          }));
        }
      }
    }
  }, [url, isMounted, retryAttempts, retryCount, retryDelay, timeout]);

  const refetch = useCallback(() => {
    setRetryAttempts(0);
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch,
    fetchData
  };
};
