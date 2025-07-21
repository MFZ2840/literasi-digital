// components/AdminWelcomeCard.tsx
import React from 'react';
import { useSession } from 'next-auth/react';

interface AdminWelcomeCardProps {
  articlesCount: number;
}

export default function AdminWelcomeCard({ articlesCount }: AdminWelcomeCardProps) {
  const { data: session, status } = useSession();

  // Show loading state while session is loading or unauthenticated
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl p-8 mb-8 text-white">
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded mb-4"></div>
          <div className="h-6 bg-white/10 rounded mb-6"></div>
          <div className="flex space-x-4">
            <div className="flex-1 h-20 bg-white/10 rounded-2xl"></div>
            <div className="flex-1 h-20 bg-white/10 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Get the display name with robust handling using useMemo
  const displayName = React.useMemo(() => {
    if (status !== 'authenticated' || !session) {
      return 'Admin';
    }
    
    if (session.user?.name) {
      return session.user.name;
    }
    if (session.user?.email) {
      return session.user.email.split('@')[0];
    }
    return 'Admin';
  }, [session, status]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl p-8 mb-8 text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-8 left-8 w-24 h-24 bg-yellow-300 rounded-full blur-2xl animate-bounce"></div>
      </div>
      
      {/* Glassmorphism overlay - PERUBAHAN: Hapus backdrop-blur-sm dan border */}
      <div className="absolute inset-0 bg-white/5 rounded-3xl"></div> 
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent drop-shadow-lg leading-tight pb-1">
              Selamat Datang, {displayName}! 👋
            </h2>
            <p className="text-indigo-100 text-xl font-medium leading-relaxed drop-shadow-sm">
              Kelola artikel literasi digital Anda dengan mudah dan efisien.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
              <span className="text-3xl">📚</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8">
          <div className="group flex items-center space-x-4 bg-white/10 rounded-2xl p-4 border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <span className="text-3xl">📝</span>
            </div>
            <div>
              <p className="text-sm text-indigo-100 font-medium uppercase tracking-wide">Total Artikel</p>
              <p className="text-3xl font-black text-white drop-shadow-lg">{articlesCount}</p>
            </div>
          </div>
          
          <div className="group flex items-center space-x-4 bg-white/10 rounded-2xl p-4 border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              {/* Custom SVG Icon for Status */}
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path 
                  d="M85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15C58.28 15 65.85 18.15 71.5 23.5" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                />
                <path 
                  d="M40 50L50 60L75 25" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-indigo-100 font-medium uppercase tracking-wide">Status</p>
              <p className="text-xl font-bold text-white drop-shadow-lg flex items-center">
                Admin Aktif
                <span className="ml-2 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Decorative bottom line */}
        <div className="mt-6 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"></div>
      </div>
    </div>
  );
}