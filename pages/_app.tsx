// pages/_app.tsx
import '@/styles/globals.css'; // Pastikan path ini benar untuk file CSS global Anda
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react'; // Import SessionProvider
import { Toaster } from 'react-hot-toast'; // Import Toaster
import Layout from '../components/Layout/Layout'; // Import komponen Layout
import ErrorBoundary from '../components/ErrorBoundary'; // --- NEW: Import komponen ErrorBoundary ---

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    // --- NEW: Bungkus seluruh aplikasi dengan ErrorBoundary ---
    <ErrorBoundary>
      <SessionProvider session={session}>
        {/* Bungkus komponen Component dengan Layout */}
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Toaster
          position="top-right"
          reverseOrder={false}
          // --- NEW: Tambahkan toastOptions seperti yang disarankan Claude AI ---
          toastOptions={{
            duration: 4000, // Durasi default untuk semua toast
            style: {
              background: '#363636', // Warna latar belakang default
              color: '#fff', // Warna teks default
            },
            success: {
              style: {
                background: '#10b981', // Warna latar belakang untuk toast sukses (hijau)
              },
            },
            error: {
              style: {
                background: '#ef4444', // Warna latar belakang untuk toast error (merah)
              },
            },
          }}
        />
      </SessionProvider>
    </ErrorBoundary>
  );
}
