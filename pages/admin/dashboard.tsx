// pages/admin/dashboard.tsx
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import ArticleForm from '../../components/ArticleForm';
import ArticleListSection from '../../components/ArticleListSection';
import AdminWelcomeCard from '../../components/AdminWelcomeCard';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import useSafeFetch from '../../hooks/useSafeFetch';
import { Article } from '../../types'; // Import Article dari file types

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [deletingArticleId, setDeletingArticleId] = useState<number | null>(null);
  const [confirmingDeleteArticleId, setConfirmingDeleteArticleId] = useState<number | null>(null);
  const [articleToDeleteTitle, setArticleToDeleteTitle] = useState<string>('');

  // Ref untuk melacak apakah komponen sudah di-mount (ditangani oleh useSafeFetch)
  const isMounted = useRef(false);

  // Ref untuk ArticleForm
  const articleFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Efek untuk mengunci scroll body saat modal terbuka
  useEffect(() => {
    if (confirmingDeleteArticleId !== null) {
      document.body.style.overflow = 'hidden'; // Kunci scroll
    } else {
      document.body.style.overflow = ''; // Kembalikan scroll
    }
    return () => {
      document.body.style.overflow = ''; // Cleanup function
    };
  }, [confirmingDeleteArticleId]); // Efek ini berjalan saat status modal berubah

  // Fungsi untuk menggulir ke ArticleForm dengan optimasi mobile
  const scrollToArticleForm = () => {
    if (articleFormRef.current) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const element = articleFormRef.current;
          if (element) {
            const rect = element.getBoundingClientRect();
            const offset = 0; // Offset 0px agar tepat di bagian paling atas

            window.scrollTo({
              top: rect.top + window.scrollY - offset,
              behavior: 'smooth'
            });
          }
        }, 50);
      });
    }
  };

  const { safeFetch } = useSafeFetch();

  const fetchArticles = async () => {
    setIsLoadingArticles(true);
    const { data, error } = await safeFetch('/api/articles', {
      showToast: true,
      errorMessage: 'Gagal memuat artikel',
    });

    if (isMounted.current && !error) {
      setArticles(data || []);
    }

    if (isMounted.current) {
      setIsLoadingArticles(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchArticles();
    }
  }, [status, session]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  const handleArticleSavedOrUpdated = () => {
    fetchArticles();
    setEditingArticleId(null);
    scrollToArticleForm();
  };

  const handleCancelEditFromForm = () => {
    setEditingArticleId(null);
    scrollToArticleForm();
  };

  const handleDelete = (id: number, title: string) => {
    setConfirmingDeleteArticleId(id);
    setArticleToDeleteTitle(title);
  };

  const confirmDeleteArticle = async () => {
    if (confirmingDeleteArticleId === null) return;

    const id = confirmingDeleteArticleId;
    setConfirmingDeleteArticleId(null);
    setArticleToDeleteTitle('');

    setDeletingArticleId(id);
    try {
      const { error } = await safeFetch(`/api/articles/${id}`, {
        method: 'DELETE',
        showToast: true,
        successMessage: 'Artikel berhasil dihapus!',
        errorMessage: 'Gagal menghapus artikel',
      });

      if (isMounted.current && !error) {
        fetchArticles();

        if (editingArticleId === id) {
          setEditingArticleId(null);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Delete aborted');
      } else {
        console.error('Error deleting article:', err);
      }
    } finally {
      if (isMounted.current) {
        setDeletingArticleId(null);
      }
    }
  };

  const cancelDelete = () => {
    setConfirmingDeleteArticleId(null);
    setArticleToDeleteTitle('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Head>
        <title>Admin Dashboard - Literasi Digital</title>
      </Head>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminWelcomeCard articlesCount={articles.length} />

        {/* Direct Article Management - No Navigation Buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ArticleForm dengan ref */}
          <div ref={articleFormRef}> 
            <ArticleForm
              key={editingArticleId || 'new-article-form'}
              onArticleSaved={handleArticleSavedOrUpdated}
              currentEditingArticleId={editingArticleId}
              onCancelEditDashboard={handleCancelEditFromForm}
            />
          </div>

          <ArticleListSection
            articles={articles}
            isLoadingArticles={isLoadingArticles}
            editingArticleId={editingArticleId}
            deletingArticleId={deletingArticleId}
            confirmingDeleteArticleId={confirmingDeleteArticleId}
            setEditingArticleId={setEditingArticleId}
            handleDelete={handleDelete}
            onEditClick={scrollToArticleForm}
          />
        </div>
      </div>

      {confirmingDeleteArticleId !== null && (
        <DeleteConfirmationModal
          isOpen={confirmingDeleteArticleId !== null}
          title={articleToDeleteTitle}
          onClose={cancelDelete}
          onConfirm={confirmDeleteArticle}
        />
      )}
    </div>
  );
}