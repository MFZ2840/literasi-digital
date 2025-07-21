// components/Layout/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import AdminProfilePage from '../AdminProfilePage';

interface HeaderProps {
  isAdminPage?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAdminPage = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const router = useRouter();
  const profileModalRef = useRef<HTMLDivElement>(null);

  // Panggil useSession di awal, di tingkat atas komponen, tanpa terkondisi
  const { data: sessionData, status } = useSession();
  const currentSession = sessionData;

  // Close profile modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileModalRef.current && !profileModalRef.current.contains(event.target as Node)) {
        setIsProfileModalOpen(false);
      }
    };

    if (isProfileModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isProfileModalOpen]);

  // Jangan render Header jika di halaman login admin
  if (router.pathname === '/admin/login') {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setSearchQuery('');
  };

  // Fungsi logout menggunakan next-auth
  const handleLogout = () => {
    signOut({ callbackUrl: '/admin/login' });
  };

  // Function to get user display name
  const getUserDisplayName = () => {
    if (currentSession?.user?.name) {
      return currentSession.user.name;
    }
    if (currentSession?.user?.email) {
      return currentSession.user.email.split('@')[0];
    }
    return 'Admin';
  };

  // Function to get user initials
  const getUserInitials = () => {
    if (currentSession?.user?.name) {
      return currentSession.user.name.charAt(0);
    }
    if (currentSession?.user?.email) {
      return currentSession.user.email.charAt(0);
    }
    return 'A';
  };

  return (
    <>
      <header className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white shadow-2xl border-b border-blue-400/30 relative overflow-hidden">
        {/* Enhanced animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating particles with improved animation */}
          <div className="absolute top-4 left-12 w-3 h-3 bg-white/20 rounded-full animate-pulse shadow-lg"></div>
          <div className="absolute top-6 right-24 w-2 h-2 bg-blue-200/40 rounded-full animate-pulse shadow-md" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-4 left-1/4 w-2.5 h-2.5 bg-indigo-200/30 rounded-full animate-pulse shadow-md" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-8 right-1/3 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse shadow-sm" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-12 left-1/2 w-1 h-1 bg-blue-300/35 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Animated gradient waves */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-blue-200/[0.02] to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Subtle geometric patterns */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/[0.02] to-transparent rounded-full transform rotate-45 animate-pulse" style={{ animationDelay: '3s' }}></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/[0.03] to-transparent rounded-full transform -rotate-45 animate-pulse" style={{ animationDelay: '2.5s' }}></div>
        </div>

        <div className="mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="flex justify-between items-center h-16 md:h-20">

            {/* Logo/Brand atau Judul Admin */}
            <div className={`flex items-center ${isSearchOpen && !isAdminPage ? 'hidden md:flex' : 'flex'}`}>
              <div className="flex-shrink-0">
                {isAdminPage ? (
                  <div className="relative group">
                    <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent tracking-tight select-none transition-all duration-500 group-hover:from-blue-100 group-hover:via-white group-hover:to-blue-100">
                      <span className="md:hidden">Dashboard</span>
                      <span className="hidden md:inline">Dashboard Admin</span>
                    </h1>
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-white/60 to-blue-200/60 group-hover:w-full transition-all duration-700 rounded-full"></div>
                    <div className="absolute inset-0 rounded-xl bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
                  </div>
                ) : (
                  <Link
                    href="/"
                    className="focus:outline-none rounded-xl block select-none transition-all duration-300 hover:scale-105 group relative"
                  >
                    <div className="absolute inset-0 rounded-xl bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
                    <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent tracking-tight select-none transition-all duration-500 group-hover:from-blue-100 group-hover:via-white group-hover:to-blue-100 relative z-10">
                      Literasi Digital
                    </h1>
                    <div className="w-0 h-0.5 bg-gradient-to-r from-white/60 to-blue-200/60 group-hover:w-full transition-all duration-700 rounded-full"></div>
                  </Link>
                )}
              </div>
            </div>

            <div className={`flex items-center space-x-3 ${isSearchOpen ? 'w-full justify-end' : ''} md:w-auto`}>
              
              {/* Form Pencarian (hanya di halaman non-admin) */}
              {!isAdminPage && (
                <>
                  <button
                    type="button"
                    onClick={toggleSearch}
                    className="md:hidden p-2.5 rounded-xl text-white/70 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all duration-300 hover:text-white hover:scale-110 backdrop-blur-sm border border-white/20 group"
                    aria-label="Buka Pencarian"
                  >
                    <svg className="w-6 h-6 transition-all duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  
                  <form
                    onSubmit={handleSearchSubmit}
                    className={`relative flex items-center ${isSearchOpen ? 'flex flex-grow' : 'hidden'} md:flex md:flex-grow-0 transition-all duration-300`}
                  >
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="Cari artikel..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2.5 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40 focus:bg-white/20 transition-all duration-300 backdrop-blur-md hover:bg-white/15 hover:border-white/30 shadow-lg"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/[0.02] via-white/[0.05] to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      <div className="absolute inset-0 rounded-xl ring-1 ring-white/10 pointer-events-none"></div>
                    </div>
                    
                    <button
                      type="submit"
                      className="absolute left-0 top-0 bottom-0 px-4 flex items-center justify-center text-white/70 hover:text-white transition-all duration-300 hover:scale-110 group"
                      aria-label="Cari"
                    >
                      <svg className="w-5 h-5 transition-all duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                    
                    {isSearchOpen && (
                      <button
                        type="button"
                        onClick={toggleSearch}
                        className="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center text-white/70 hover:text-white transition-all duration-300 md:hidden hover:scale-110 group"
                        aria-label="Tutup Pencarian"
                      >
                        <svg className="w-5 h-5 transition-all duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </form>
                </>
              )}

              {/* Clickable Info User Admin (hanya jika isAdminPage) */}
              {isAdminPage && (
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className={`flex items-center space-x-2 px-2 py-1 rounded-xl transition-all duration-300 group hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 ${isSearchOpen ? 'hidden' : 'flex'} md:flex`}
                >
                  <div className="relative">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/40 group-hover:ring-white/60 transition-all duration-300">
                      <span className="text-white font-bold text-xs md:text-sm">
                        {currentSession ? getUserInitials() : 'A'}
                      </span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                  </div>
                  <div className="hidden md:flex flex-col min-w-0">
                    <span className="text-xs md:text-sm font-semibold text-white/95 whitespace-nowrap truncate">
                      {currentSession ? getUserDisplayName() : 'Admin'}
                    </span>
                    <span className="text-xxs md:text-xs text-white/70 font-medium">Administrator</span>
                  </div>
                </button>
              )}

              {/* Tombol Logout (hanya jika isAdminPage) */}
              {isAdminPage && (
                <button
                  onClick={handleLogout}
                  className={`group relative inline-flex items-center px-2.5 py-2.5 md:px-4 md:py-2.5 border border-transparent text-base md:text-lg font-medium rounded-xl text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden ${isSearchOpen ? 'hidden' : 'flex'} md:flex mr-3`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <svg className="w-5 h-5 md:w-4 md:h-4 mr-0 md:mr-2 transition-transform duration-200 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="hidden md:block relative z-10 transition-all duration-300 group-hover:text-red-100">Logout</span>
                </button>
              )}

              {/* Tombol Beranda */}
              <nav className={`flex items-center ${isSearchOpen ? 'hidden' : 'flex'} md:flex`}>
                <Link
                  href="/"
                  className="group relative inline-flex items-center px-2.5 py-2.5 md:px-4 md:py-2.5 text-base md:text-lg font-medium text-white rounded-xl transition-all duration-300 hover:bg-white/15 hover:backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-blue-600 hover:scale-105 overflow-hidden"
                >
                  <svg className="w-6 h-6 md:hidden transition-all duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0L0 12h3v12h6v-8h6v8h6V12h3L12 0zm0 4.414L20.586 13H18v9h-4v-6h-4v6H6v-9H3.414L12 4.414z"/>
                  </svg>
                  <span className="hidden md:block relative z-10 transition-all duration-300 group-hover:text-blue-100">Beranda</span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/[0.02] via-white/[0.08] to-white/[0.02] opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"></div>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-white via-blue-200 to-white group-hover:w-full transition-all duration-700 rounded-full"></div>
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Enhanced decorative bottom border */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/60 to-transparent animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-indigo-200/30 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </header>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div 
              ref={profileModalRef}
              className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Profile Content */}
              <AdminProfilePage />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;