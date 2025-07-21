// components/Admin/AdminProfilePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import Head from 'next/head'; // Import Head untuk SEO dan judul halaman

export default function AdminProfilePage() {
  const { data: session, update: updateSession, status: sessionStatus } = useSession(); // Ambil sessionStatus
  const router = useRouter();
  
  // State untuk username dan email, diinisialisasi dari localStorage
  const [username, setUsername] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedUsername = localStorage.getItem('adminProfileUsername');
      return savedUsername !== null ? savedUsername : '';
    }
    return '';
  });
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('adminProfileEmail');
      return savedEmail !== null ? savedEmail : '';
    }
    return '';
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const isInitialSessionLoadHandled = useRef(false);

  // Redirect jika tidak terautentikasi atau bukan admin
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/admin/login');
    } else if (sessionStatus === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/'); // Redirect ke halaman utama jika bukan admin
    }
  }, [sessionStatus, session, router]);

  // Sinkronisasi state lokal dengan data sesi saat dimuat pertama kali
  useEffect(() => {
    if (session?.user && !isInitialSessionLoadHandled.current) {
      if (username === '' || username !== (session.user.name || '')) {
        setUsername(session.user.name || '');
      }
      if (email === '' || email !== (session.user.email || '')) {
        setEmail(session.user.email || '');
      }
      isInitialSessionLoadHandled.current = true;
    }
    // Reset flag jika sesi tidak ada (misal setelah logout)
    if (!session?.user) {
      isInitialSessionLoadHandled.current = false;
    }
  }, [session, username, email]); // Tambahkan username dan email ke dependencies

  // Simpan username ke localStorage saat berubah
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminProfileUsername', username);
    }
  }, [username]);

  // Simpan email ke localStorage saat berubah
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminProfileEmail', email);
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({}); // Reset error sebelum validasi baru

    if (!session?.user) {
      toast.error("Pengguna belum diautentikasi.");
      return;
    }

    let newErrors: { [key: string]: string } = {};

    // Validasi Current Password, harus selalu diisi
    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Password saat ini wajib diisi untuk konfirmasi.';
    }

    let hasChanges = false;

    // Validasi Username
    const usernameChanged = username.trim() !== (session.user.name || '').trim();
    if (usernameChanged) {
      if (username.trim() === '') {
        newErrors.username = 'Username tidak boleh kosong jika diubah.';
      }
      hasChanges = true;
    }

    // Validasi Email
    const emailChanged = email.trim() !== (session.user.email || '').trim();
    if (emailChanged) {
      if (!email.trim() || !email.includes('@')) {
        newErrors.email = 'Email baru tidak valid jika diubah.';
      }
      hasChanges = true;
    }

    // Validasi Password Baru
    const passwordChanged = newPassword.trim() !== '' || confirmNewPassword.trim() !== '';
    if (passwordChanged) {
      if (newPassword.length < 6) {
        newErrors.newPassword = 'Password baru minimal 6 karakter.';
      }
      if (newPassword !== confirmNewPassword) {
        newErrors.confirmNewPassword = 'Konfirmasi password baru tidak cocok.';
      }
      hasChanges = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      toast.error("Harap perbaiki kesalahan pada form.");
      return;
    }

    if (!hasChanges) {
      toast.success("Tidak ada perubahan yang terdeteksi.");
      return;
    }

    setIsSubmitting(true);
    let successMessages: string[] = [];
    let errorOccurred = false;

    try {
      // Update Username
      if (usernameChanged) {
        console.log('AdminProfilePage: Attempting to update username to:', username);
        const response = await fetch('/api/admin/profile/update-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, currentPassword }),
        });
        const data = await response.json();
        console.log('AdminProfilePage: API response data for username:', data);

        if (response.ok) {
          successMessages.push('Username berhasil diperbarui.');
          await updateSession({ name: username }); // Update sesi dengan nama baru
        } else {
          errorOccurred = true;
          toast.error(data.message || 'Gagal memperbarui username.');
        }
      }

      // Update Email
      if (emailChanged && !errorOccurred) { // Lanjutkan jika tidak ada error sebelumnya
        console.log('AdminProfilePage: Attempting to update email to:', email);
        const response = await fetch('/api/admin/profile/update-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newEmail: email, currentPassword }),
        });
        const data = await response.json();
        console.log('AdminProfilePage: API response data for email:', data);

        if (response.ok) {
          successMessages.push('Email berhasil diperbarui.');
          await updateSession({ email: email }); // Update sesi dengan email baru
        } else {
          errorOccurred = true;
          toast.error(data.message || 'Gagal memperbarui email.');
        }
      }

      // Update Password
      if (passwordChanged && !errorOccurred) { // Lanjutkan hanya jika tidak ada error sebelumnya
        console.log('AdminProfilePage: Attempting to update password.');
        const response = await fetch('/api/admin/profile/update-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPassword, confirmNewPassword, currentPassword }),
        });
        const data = await response.json();
        console.log('AdminProfilePage: API response data for password:', data);

        if (response.ok) {
          successMessages.push('Password berhasil diperbarui.');
          setNewPassword('');
          setConfirmNewPassword('');
        } else {
          errorOccurred = true;
          toast.error(data.message || 'Gagal memperbarui password.');
        }
      }

      // Finalisasi: Tampilkan toast sukses jika ada perubahan dan tidak ada error
      if (!errorOccurred && successMessages.length > 0) {
        toast.success(successMessages.join(' '));
        setCurrentPassword(''); // Reset current password setelah sukses
        
        // Hapus item dari localStorage setelah berhasil disimpan
        if (typeof window !== 'undefined') {
          localStorage.removeItem('adminProfileUsername');
          localStorage.removeItem('adminProfileEmail');
        }

        // Logout dan redirect ke halaman login admin
        await signOut({ redirect: false });
        router.push('/admin/login');

      } else if (successMessages.length === 0 && !errorOccurred) {
        toast.success("Tidak ada perubahan yang perlu disimpan.");
      }

    } catch (error: any) {
      console.error("Error during profile update:", error);
      toast.error(`Terjadi kesalahan: ${error.message}`);
      errorOccurred = true;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tampilkan loading state jika sesi belum dimuat atau sedang diautentikasi
  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">Memuat profil...</p>
        </div>
      </div>
    );
  }

  // Jangan render jika tidak terautentikasi atau bukan admin (sudah ditangani di useEffect)
  if (sessionStatus === 'unauthenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 font-inter">
      <Head>
        <title>Pengaturan Profil Admin</title>
      </Head>
      <div className="max-w-4xl mx-auto">
        {/* Main Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-200/50 border border-white/20 overflow-hidden transform transition-all duration-500 hover:scale-[1.005]">
          {/* Header Section with Enhanced Design */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 sm:p-8 lg:p-10 text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <pattern id="pattern-circles" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="white" />
                </pattern>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
                <defs>
                  <linearGradient id="gradient-overlay" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#gradient-overlay)" />
              </svg>
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/30 shadow-lg transform transition-transform duration-300 hover:scale-110">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                </div>
                
                {/* Title and Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight drop-shadow-md">
                      Pengaturan Profil
                    </h1>
                    <span className="text-2xl sm:text-3xl animate-spin-slow">⚙️</span>
                  </div>
                  <p className="text-indigo-100 text-sm sm:text-base font-medium opacity-90 drop-shadow-sm">
                    Kelola informasi akun administrator Anda dengan aman
                  </p>
                </div>
              </div>
              
              {/* Info Banner */}
              <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-inner">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">💡</span>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed">
                    Hanya isi kolom yang ingin Anda ubah. Pastikan untuk selalu mengisi 'Password Saat Ini' untuk mengonfirmasi setiap perubahan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6 sm:p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Username Section */}
              <div className="group">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200/60 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:border-indigo-200 transform hover:-translate-y-1">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Username</h2>
                  </div>
                  
                  <div>
                    <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-3">
                      Username Baru
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => { 
                        setUsername(e.target.value); 
                        setFormErrors(prev => { 
                          const newErrors = { ...prev };
                          delete newErrors.username;
                          return newErrors;
                        }); 
                      }}
                      className={`w-full px-4 py-4 rounded-xl border-2 ${
                        formErrors.username 
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-200' 
                          : 'border-slate-200 bg-white focus:border-indigo-500 focus:ring-indigo-200'
                      } focus:outline-none focus:ring-4 transition-all duration-200 text-slate-800 placeholder-slate-400 text-base shadow-sm`}
                      placeholder="Masukkan username baru"
                      disabled={isSubmitting}
                    />
                    {formErrors.username && (
                      <div className="mt-3 flex items-center space-x-2 text-red-600 animate-fade-in-down">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium">{formErrors.username}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Email Section */}
              <div className="group">
                <div className="bg-gradient-to-r from-slate-50 to-emerald-50 border border-slate-200/60 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:border-emerald-200 transform hover:-translate-y-1">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Email</h2>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                      Email Baru
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => { 
                        setEmail(e.target.value); 
                        setFormErrors(prev => { 
                          const newErrors = { ...prev };
                          delete newErrors.email;
                          return newErrors;
                        }); 
                      }}
                      className={`w-full px-4 py-4 rounded-xl border-2 ${
                        formErrors.email 
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-200' 
                          : 'border-slate-200 bg-white focus:border-emerald-500 focus:ring-emerald-200'
                      } focus:outline-none focus:ring-4 transition-all duration-200 text-slate-800 placeholder-slate-400 text-base shadow-sm`}
                      placeholder="Masukkan email baru"
                      disabled={isSubmitting}
                    />
                    {formErrors.email && (
                      <div className="mt-3 flex items-center space-x-2 text-red-600 animate-fade-in-down">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium">{formErrors.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="group">
                <div className="bg-gradient-to-r from-slate-50 to-amber-50 border border-slate-200/60 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:border-amber-200 transform hover:-translate-y-1">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Password</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-semibold text-slate-700 mb-3">
                        Password Baru
                      </label>
                      <input
                        type="password"
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => { 
                          setNewPassword(e.target.value); 
                          setFormErrors(prev => { 
                            const newErrors = { ...prev };
                            delete newErrors.newPassword;
                            return newErrors;
                          }); 
                        }}
                        className={`w-full px-4 py-4 rounded-xl border-2 ${
                          formErrors.newPassword 
                            ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-200' 
                            : 'border-slate-200 bg-white focus:border-amber-500 focus:ring-amber-200'
                        } focus:outline-none focus:ring-4 transition-all duration-200 text-slate-800 placeholder-slate-400 text-base shadow-sm`}
                        placeholder="Masukkan password baru"
                        disabled={isSubmitting}
                      />
                      {formErrors.newPassword && (
                        <div className="mt-3 flex items-center space-x-2 text-red-600 animate-fade-in-down">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm font-medium">{formErrors.newPassword}</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="confirm-new-password" className="block text-sm font-semibold text-slate-700 mb-3">
                        Konfirmasi Password Baru
                      </label>
                      <input
                        type="password"
                        id="confirm-new-password"
                        value={confirmNewPassword}
                        onChange={(e) => { 
                          setConfirmNewPassword(e.target.value); 
                          setFormErrors(prev => { 
                            const newErrors = { ...prev };
                            delete newErrors.confirmNewPassword;
                            return newErrors;
                          }); 
                        }}
                        className={`w-full px-4 py-4 rounded-xl border-2 ${
                          formErrors.confirmNewPassword 
                            ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-200' 
                            : 'border-slate-200 bg-white focus:border-amber-500 focus:ring-amber-200'
                        } focus:outline-none focus:ring-4 transition-all duration-200 text-slate-800 placeholder-slate-400 text-base shadow-sm`}
                        placeholder="Konfirmasi password baru"
                        disabled={isSubmitting}
                      />
                      {formErrors.confirmNewPassword && (
                        <div className="mt-3 flex items-center space-x-2 text-red-600 animate-fade-in-down">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm font-medium">{formErrors.confirmNewPassword}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Password Confirmation */}
              <div className="group">
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:border-rose-200 transform hover:-translate-y-1">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Konfirmasi Perubahan</h2>
                  </div>
                  
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-semibold text-slate-700 mb-3">
                      Password Saat Ini <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="current-password"
                      value={currentPassword}
                      onChange={(e) => { 
                        setCurrentPassword(e.target.value); 
                        setFormErrors(prev => { 
                          const newErrors = { ...prev };
                          delete newErrors.currentPassword;
                          return newErrors;
                        }); 
                      }}
                      className={`w-full px-4 py-4 rounded-xl border-2 ${
                        formErrors.currentPassword 
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-200' 
                          : 'border-slate-200 bg-white focus:border-red-500 focus:ring-red-200'
                      } focus:outline-none focus:ring-4 transition-all duration-200 text-slate-800 placeholder-slate-400 text-base shadow-sm`}
                      placeholder="Masukkan password saat ini untuk konfirmasi"
                      disabled={isSubmitting}
                      required
                    />
                    {formErrors.currentPassword && (
                      <div className="mt-3 flex items-center space-x-2 text-red-600 animate-fade-in-down">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium">{formErrors.currentPassword}</p>
                      </div>
                    )}
                    <p className="mt-3 text-xs text-slate-500 flex items-center space-x-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Wajib diisi untuk mengkonfirmasi semua perubahan profil</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-600 disabled:hover:via-purple-600 disabled:hover:to-pink-600 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-3 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
