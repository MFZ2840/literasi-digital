// components/ArticleForm.tsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic'; // <-- Tambahkan import dynamic dari next/dynamic

// --- HAPUS: Impor CKEditor 5 secara langsung di sini ---
// import { CKEditor } from '@ckeditor/ckeditor5-react';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// --- TAMBAH: Impor komponen CKEditorComponent secara dinamis ---
// Pastikan path ini benar sesuai lokasi file CKEditorComponent.tsx Anda
const DynamicCKEditor = dynamic(
  () => import('./CKEditorComponent'), // Sesuaikan path jika CKEditorComponent.tsx ada di folder lain
  { ssr: false } // Ini SANGAT PENTING untuk menonaktifkan SSR
);

// Tambahkan prop onArticleSaved untuk memberitahu parent saat artikel disimpan/diperbarui
// Tambahkan prop currentEditingArticleId untuk membantu mereset form jika artikel yang diedit dihapus dari luar
interface ArticleFormProps {
  onArticleSaved: () => void; // Fungsi callback untuk memberitahu Dashboard bahwa ada perubahan
  currentEditingArticleId: number | null; // ID artikel yang sedang diedit di Dashboard
  onCancelEditDashboard: () => void; // Callback untuk mereset editingArticle di Dashboard
}

interface ArticleFormData {
  id?: number;
  title: string;
  content: string;
  seriesSlug: string;
  order: number;
  image?: string | null;
}

interface FormErrors {
  title?: string;
  content?: string;
  seriesSlug?: string;
  order?: string;
  image?: string;
}

interface ServerErrorResponse {
  message: string;
  field?: string;
}

export default function ArticleForm({ onArticleSaved, currentEditingArticleId, onCancelEditDashboard }: ArticleFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [seriesSlug, setSeriesSlug] = useState('');
  const [order, setOrder] = useState<number | ''>(1);
  const [image, setImage] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleFormData | null>(null); // State untuk mengelola mode edit di dalam ArticleForm

  // Efek untuk mengisi form saat editingArticle berubah (dari edit button di Dashboard)
  useEffect(() => {
    // Jika currentEditingArticleId berubah dan ada, ambil data artikel
    if (currentEditingArticleId !== null && editingArticle?.id !== currentEditingArticleId) {
      const fetchArticleToEdit = async () => {
        try {
          const res = await fetch(`/api/articles/${currentEditingArticleId}`);
          if (!res.ok) {
            throw new Error('Gagal mengambil data artikel untuk diedit.');
          }
          const data: ArticleFormData = await res.json();
          setEditingArticle(data); // Set data yang akan diedit
          setTitle(data.title);
          setContent(data.content);
          setSeriesSlug(data.seriesSlug);
          setOrder(data.order);
          setImage(data.image || '');
          setFormErrors({}); // Hapus error saat data awal berubah
        } catch (err: any) {
          console.error('Failed to fetch article for editing:', err);
          toast.error('Gagal memuat artikel untuk diedit.');
          setEditingArticle(null); // Reset jika gagal ambil data
          onCancelEditDashboard(); // Beritahu dashboard untuk membatalkan mode edit
        }
      };
      fetchArticleToEdit();
    } else if (currentEditingArticleId === null && editingArticle !== null) {
      // Jika currentEditingArticleId di Dashboard null, dan kita masih di mode edit, reset form
      setEditingArticle(null);
      resetForm();
    } else if (currentEditingArticleId === null && editingArticle === null) {
      // Ini adalah skenario untuk form tambah baru, pastikan form bersih
      resetForm();
    }
  }, [currentEditingArticleId]); // Bergantung pada currentEditingArticleId dari props Dashboard

  // Fungsi untuk mereset semua field form
  const resetForm = () => {
    setTitle('');
    setContent('');
    setSeriesSlug('');
    setOrder(1);
    setImage('');
    setFormErrors({});
    setIsSubmitting(false);
  };

  // Fungsi validasi form
  const validateForm = () => {
    const errors: FormErrors = {};

    if (!title.trim()) { errors.title = 'Judul wajib diisi.'; } else if (title.trim().length < 3) { errors.title = 'Judul minimal 3 karakter.'; }
    
    // --- START: Pembaharuan Validasi Konten untuk CKEditor ---
    const strippedContent = content.replace(/(<([^>]+)>)/gi, "").trim(); // Hapus tag HTML
    if (!strippedContent) { 
        errors.content = 'Konten wajib diisi.'; 
    } else if (strippedContent.length < 10) { 
        errors.content = 'Konten minimal 10 karakter (teks asli tanpa format).'; 
    }
    // --- END: Pembaharuan Validasi Konten untuk CKEditor ---

    if (!seriesSlug.trim()) { errors.seriesSlug = 'Series Slug wajib diisi.'; } else if (seriesSlug.trim().length < 3) { errors.seriesSlug = 'Series Slug minimal 3 karakter.'; } else if (!/^[a-z0-9-]+$/.test(seriesSlug)) { errors.seriesSlug = 'Series Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung (-).'; }
    if (order === '' || isNaN(Number(order)) || Number(order) < 1) { errors.order = 'Urutan harus berupa angka positif.'; }
    if (image.trim()) { try { new URL(image); } catch (_) { errors.image = 'URL Gambar tidak valid.'; } }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handler saat form disubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormErrors({}); // Hapus error sebelumnya

    if (!validateForm()) {
      toast.error('Harap perbaiki kesalahan pada form.');
      return;
    }

    setIsSubmitting(true);

    const formData = {
      title,
      content, // 'content' sudah dalam bentuk HTML dari CKEditor
      seriesSlug,
      order: Number(order),
      image: image.trim() === '' ? null : image,
    };

    try {
      let res;
      if (editingArticle) {
        res = await fetch(`/api/articles/${editingArticle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (!res.ok) {
        const errorData: ServerErrorResponse = await res.json();
        console.error('API Error Response:', errorData);

        if (errorData.field) {
          setFormErrors({ [errorData.field]: errorData.message });
          toast.error(errorData.message);
          return;
        } else {
          toast.error(errorData.message || 'Terjadi kesalahan saat menyimpan artikel.');
        }
        throw new Error(errorData.message || 'Terjadi kesalahan saat menyimpan artikel.');
      }

      toast.success(`Artikel berhasil ${editingArticle ? 'diperbarui' : 'ditambahkan'}!`);
      resetForm(); // Reset form setelah berhasil
      setEditingArticle(null); // Keluar dari mode edit
      onArticleSaved(); // Beritahu Dashboard bahwa artikel telah disimpan/diperbarui
      onCancelEditDashboard(); // Beritahu dashboard untuk mereset editingArticle
    } catch (err: any) {
      console.error('Error saving article:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingArticle(null);
    resetForm();
    onCancelEditDashboard(); // Beritahu dashboard untuk mereset editingArticle
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 backdrop-blur-sm rounded-3xl shadow-2xl shadow-indigo-500/10 p-8 border border-white/20 hover:shadow-indigo-500/20 transition-all duration-500">
      {/* Header Section with Enhanced Animation */}
      <div className="relative mb-8 p-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-blue-600/90 rounded-2xl backdrop-blur-sm"></div>
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                {editingArticle ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
              </div>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="text-white">
            <h3 className="text-2xl font-bold tracking-tight drop-shadow-sm">
              {editingArticle ? 'Edit Artikel' : 'Tambah Artikel Baru'}
            </h3>
            <p className="text-white/80 text-sm font-medium mt-1">
              {editingArticle ? 'Perbarui konten artikel Anda' : 'Buat artikel menarik untuk pembaca'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Judul Artikel */}
        <div className="group">
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors duration-200">
            ✨ Judul Artikel
          </label>
          <div className="relative">
            <input
              type="text"
              id="title"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 text-gray-800 font-medium placeholder-gray-400 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md focus:shadow-lg ${
                formErrors.title 
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 hover:border-indigo-300'
              } focus:outline-none`}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setFormErrors(prev => ({ ...prev, title: undefined })); }}
              placeholder="Masukkan judul artikel yang menarik..."
              required
              disabled={isSubmitting}
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
          {formErrors.title && (
            <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{formErrors.title}</span>
            </p>
          )}
        </div>

        {/* --- START: Input Konten Artikel dengan CKEditor --- */}
        <div className="group">
          <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors duration-200">
            📝 Konten Artikel
          </label>
          <div className="relative z-10"> {/* z-10 penting agar toolbar CKEditor tidak terpotong oleh elemen lain */}
            {/* PERUBAHAN UNTUK PROBLEM 1: Menggunakan 'as any' untuk editor prop */}
            {/* PERUBAHAN UNTUK PROBLEM 2: Menghapus className dari CKEditor dan menerapkan ke div pembungkus */}
            {/* GANTI CKEditor ini dengan DynamicCKEditor */}
            <DynamicCKEditor // <-- Gunakan DynamicCKEditor di sini
              initialData={content} // Mengikat data editor ke state `content`
              onChange={ (data: string) => { // Perbaiki tipe data untuk onChange
                setContent(data); // Mengambil konten dalam bentuk HTML
                setFormErrors(prev => ({ ...prev, content: undefined }));
              }}
              // Hapus config dan disabled di sini, pindahkan ke CKEditorComponent.tsx jika perlu
              // config={{
              //   toolbar: {
              //       items: [
              //           'heading', '|', 'bold', 'italic', 'underline', 'link', 'bulletedList', 'numberedList',
              //           'blockQuote', '|', 'imageUpload', 'insertTable', 'mediaEmbed', 'codeBlock', '|',
              //           'undo', 'redo'
              //       ]
              //   },
              //   placeholder: "Tulis konten artikel Anda di sini... Jelaskan topik dengan detail dan menarik untuk pembaca.",
              // }}
              // disabled={isSubmitting}
            />
            {/* Pindahkan styling dari sini ke CKEditorComponent.tsx atau globals.css */}
            <style jsx global>{`
              .ck-editor__editable_inline {
                border-radius: 0.75rem; /* rounded-xl */
                border-width: 2px; /* border-2 */
                transition-property: all;
                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                transition-duration: 300ms;
                color: #1f2937; /* text-gray-800 */
                font-weight: 500; /* font-medium */
                background-color: rgba(255, 255, 255, 0.8); /* bg-white/80 */
                backdrop-filter: blur(4px); /* backdrop-blur-sm */
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
              }
              .ck-editor__editable_inline:hover {
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* hover:shadow-md */
              }
              .ck-editor__editable_inline:focus-within {
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* focus:shadow-lg */
                outline: none;
              }

              /* Border styling based on formErrors.content */
              .ck-editor__editable_inline {
                border-color: ${formErrors.content ? '#f87171' : '#e5e7eb'}; /* border-red-400 vs border-gray-200 */
              }
              .ck-editor__editable_inline:focus-within {
                border-color: ${formErrors.content ? '#ef4444' : '#6366f1'}; /* focus:border-red-500 vs focus:border-indigo-500 */
                box-shadow: ${formErrors.content ? '0 0 0 4px rgba(239, 68, 68, 0.2)' : '0 0 0 4px rgba(99, 102, 241, 0.2)'}; /* focus:ring-4 focus:ring-red-500/20 vs focus:ring-4 focus:ring-indigo-500/20 */
              }
              .ck-editor__editable_inline:hover {
                border-color: ${formErrors.content ? '#ef4444' : '#a5b4fc'}; /* hover:border-red-500 vs hover:border-indigo-300 */
              }
            `}</style>
          </div>
          {formErrors.content && (
            <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{formErrors.content}</span>
            </p>
          )}
        </div>
        {/* --- END: Input Konten Artikel dengan CKEditor --- */}

        {/* Grid untuk Input Series dan Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Slug Seri */}
          <div className="group">
            <label htmlFor="seriesSlug" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors duration-200">
              🔗 Slug Seri
            </label>
            <div className="relative">
              <input
                type="text"
                id="seriesSlug"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 text-gray-800 font-medium placeholder-gray-400 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md focus:shadow-lg ${
                  formErrors.seriesSlug 
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
                    : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 hover:border-indigo-300'
                } focus:outline-none`}
                value={seriesSlug}
                onChange={(e) => { setSeriesSlug(e.target.value); setFormErrors(prev => ({ ...prev, seriesSlug: undefined })); }}
                placeholder="literasi-digital-dasar"
                required
                disabled={isSubmitting}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {formErrors.seriesSlug && (
              <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{formErrors.seriesSlug}</span>
              </p>
            )}
          </div>

          {/* Input Urutan Artikel */}
          <div className="group">
            <label htmlFor="order" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors duration-200">
              📊 Urutan dalam Seri
            </label>
            <div className="relative">
              <input
                type="number"
                id="order"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 text-gray-800 font-medium placeholder-gray-400 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md focus:shadow-lg ${
                  formErrors.order 
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
                    : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 hover:border-indigo-300'
                } focus:outline-none`}
                value={order}
                onChange={(e) => {
                  const val = e.target.value;
                  setOrder(val === '' ? '' : Number(val));
                  setFormErrors(prev => ({ ...prev, order: undefined }));
                }}
                placeholder="1"
                required
                min="1"
                disabled={isSubmitting}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {formErrors.order && (
              <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{formErrors.order}</span>
              </p>
            )}
          </div>
        </div>

        {/* Input URL Gambar */}
        <div className="group">
          <label htmlFor="image" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors duration-200">
            🖼️ URL Gambar <span className="text-gray-500 font-normal">(Opsional)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="image"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 text-gray-800 font-medium placeholder-gray-400 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md focus:shadow-lg ${
                formErrors.image 
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 hover:border-indigo-300'
              } focus:outline-none`}
              value={image}
              onChange={(e) => { setImage(e.target.value); setFormErrors(prev => ({ ...prev, image: undefined })); }}
              placeholder="https://example.com/gambar-artikel.jpg"
              disabled={isSubmitting}
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
          {formErrors.image && (
            <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{formErrors.image}</span>
            </p>
          )}
        </div>

        {/* Tombol Aksi dengan Enhanced Design */}
        <div className="pt-6 border-t border-gray-200/50">
          {editingArticle ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 group relative overflow-hidden px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-300 font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <div className="relative flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Batal Edit</span>
                </div>
              </button>
              <button
                type="submit"
                className="flex-1 group relative overflow-hidden px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={isSubmitting}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Memperbarui...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>Perbarui Artikel</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full group relative overflow-hidden px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={isSubmitting}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center space-x-3">
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-lg">Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-lg">Simpan Artikel</span>
                  </>
                )}
              </div>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}