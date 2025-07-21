// components/Layout/Layout.tsx
import React, { ReactNode, useEffect, useState } from 'react'; // Import useState dan useEffect
import { useRouter } from 'next/router'; // Import useRouter
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false); // State untuk melacak apakah kita di sisi klien

  useEffect(() => {
    setIsClient(true); // Set true setelah komponen di-mount di sisi klien
  }, []);

  // Hindari hydration mismatch dengan memastikan router sudah ready
  const isAdminPage = isClient && router.pathname.startsWith('/admin');

  return (
    // PERUBAHAN: Menghapus 'overflow-hidden' dari div terluar ini.
    // Ini jarang diperlukan di sini dan bisa menyebabkan masalah konteks posisi.
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 relative">
      {/* Background decorative elements (Ini adalah bercak-bercak biru besar yang blur) */}
      {isClient && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100/10 rounded-full blur-3xl"></div>
        </div>
      )}
      
      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {isClient && <Header isAdminPage={isAdminPage} />}
        
        {/* Main content area */}
        {/* PERUBAHAN: Tambahkan min-h-screen di sini untuk memastikan area konten selalu cukup tinggi */}
        <main className="flex-grow relative min-h-screen">
          {/* Content container with subtle backdrop */}
          <div className="relative z-10">
            {/* PERUBAHAN PENTING: Hapus 'backdrop-blur-sm' dari div ini.
                Properti 'backdrop-filter' dapat menciptakan konteks penumpukan baru
                yang menyebabkan 'position: fixed' di dalamnya tidak lagi relatif terhadap viewport. */}
            <div className="bg-white/40"> {/* 'backdrop-blur-sm' dihapus */}
              {children}
            </div>
          </div>
          
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}></div>
          </div>
        </main>
        
        <Footer />
      </div>
      
      {/* Subtle animated background elements (Ini adalah titik-titik kecil yang berkedip) */}
      {isClient && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-blue-300/30 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-indigo-300/40 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-purple-300/30 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-blue-400/30 rounded-full animate-pulse delay-3000"></div>
        </div>
      )}
    </div>
  );
};

export default Layout;
