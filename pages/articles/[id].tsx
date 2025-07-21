// pages/articles/[id].tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Article } from '../../types';
import ArticleDetailContent from '../../components/Article/ArticleDetailContent';
// --- NEW: Import komponen shared ---
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import ErrorMessage from '../../components/Shared/ErrorMessage';

const ArticleDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/public/articles/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Artikel tidak ditemukan atau gagal dimuat.');
        }
        const data: Article = await response.json();
        setArticle(data);
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat memuat artikel.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  // Kondisi loading, error, dan not found
  if (isLoading) {
    return (
      // --- NEW: Gunakan LoadingSpinner ---
      <div className="flex items-center justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        {/* --- NEW: Gunakan ErrorMessage --- */}
        <ErrorMessage message={error} />
        <Link href="/" className="text-blue-600 hover:underline mt-4"> {/* Tambahkan mt-4 agar ada jarak */}
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <p className="text-gray-600 text-lg mb-4">Artikel tidak ditemukan.</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>{article.title} - Literasi Digital</title>
        <meta name="description" content={article.content.substring(0, 150) + '...'} />
      </Head>

      <ArticleDetailContent article={article} />
    </div>
  );
};

export default ArticleDetailPage;