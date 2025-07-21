// components/Layout/Footer.tsx
import React from 'react';
import { useRouter } from 'next/router';

const Footer: React.FC = () => {
  const router = useRouter();

  // Jangan render Footer jika di halaman login admin
  if (router.pathname === '/admin/login') {
    return null;
  }

  return (
    <footer className="relative bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 text-white mt-10 border-t border-gray-700/50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle moving gradients */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      </div>

      {/* Decorative top border with animation */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent animate-pulse"></div>
      </div>
            
      <div className="relative">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center space-y-4">
            {/* Logo/Brand with enhanced styling */}
            <div className="text-center group">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent transition-all duration-300 group-hover:from-blue-300 group-hover:via-indigo-300 group-hover:to-purple-300">
                Literasi Digital
              </h3>
              <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mt-2 rounded-full opacity-60"></div>
            </div>
                        
            {/* Mission statement dan Copyright dalam satu baris */}
            <div className="text-center">
              <p className="text-sm text-gray-300 mb-2">
                Meningkatkan pemahaman teknologi digital untuk masa depan yang lebih baik
              </p>
              <p className="text-sm text-gray-400 transition-colors duration-300 hover:text-gray-300">
                &copy; {new Date().getFullYear()} Literasi Digital. Semua Hak Cipta Dilindungi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;