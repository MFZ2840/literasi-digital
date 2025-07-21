// hooks/useSafeFetch.ts
import { useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

interface FetchOptions extends RequestInit {
  showToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export const useSafeFetch = () => {
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const safeFetch = useCallback(async (
    url: string,
    options: FetchOptions = {}
  ) => {
    const {
      showToast = false,
      successMessage,
      errorMessage,
      ...fetchOptions
    } = options;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        // Coba parse error data dari respons, jika gagal, gunakan objek kosong.
        // Asumsi error responses (non-2xx) akan selalu berupa JSON atau bisa ditangani jika kosong.
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // --- PERBAIKAN UTAMA ADA DI SINI ---
      // Jika status adalah 204 No Content atau 205 Reset Content, tidak ada body JSON yang diharapkan.
      if (response.status === 204 || response.status === 205) {
        if (isMountedRef.current) {
          if (showToast && successMessage) {
            toast.success(successMessage);
          }
          return { data: null, error: null }; // Kembalikan data null
        }
        return { data: null, error: null };
      }

      // Parse data JSON dari respons hanya jika status bukan 204/205
      const data = await response.json();

      if (isMountedRef.current) {
        if (showToast && successMessage) {
          toast.success(successMessage);
        }
        return { data, error: null };
      }

      return { data: null, error: null };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
        return { data: null, error: null };
      }

      console.error('Fetch error:', error);
      
      if (isMountedRef.current) {
        if (showToast) {
          toast.error(errorMessage || error.message || 'Terjadi kesalahan');
        }
        return { data: null, error };
      }

      return { data: null, error };
    }
  }, []);

  return { safeFetch, isMounted: () => isMountedRef.current };
};

export default useSafeFetch;
