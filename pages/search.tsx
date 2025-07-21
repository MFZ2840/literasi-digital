// pages/search.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Article } from '../types';
import ArticleCard from '../components/Article/ArticleCard';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import ErrorMessage from '../components/Shared/ErrorMessage';
import { stripHtmlTags } from '../utils/textProcessors'; // Import stripHtmlTags

const SearchPage: React.FC = () => {
  const router = useRouter();
  const { q } = router.query;
  const searchQuery = typeof q === 'string' ? q : '';

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (!searchQuery) {
      setIsLoading(false);
      setArticles([]);
      setDisplayedArticles([]);
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/public/articles/search?q=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) {
          throw new Error('Gagal mengambil hasil pencarian.');
        }
        const data: Article[] = await response.json();
        setArticles(data);
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat memuat hasil pencarian.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  useEffect(() => {
    if (articles.length > 0 && searchQuery) {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();

      const titleMatches: Article[] = [];
      const contentMatches: Article[] = [];

      articles.forEach(article => {
        const titleLower = article.title.toLowerCase();
        // --- PERUBAHAN DI SINI: Gunakan stripHtmlTags ---
        const contentCleanedLower = stripHtmlTags(article.content).toLowerCase();

        if (titleLower.includes(lowerCaseSearchQuery)) {
          titleMatches.push(article);
        } else if (contentCleanedLower.includes(lowerCaseSearchQuery)) {
          contentMatches.push(article);
        }
      });

      setDisplayedArticles([...titleMatches, ...contentMatches]);
    } else if (!searchQuery) {
        setDisplayedArticles([]);
    } else {
        setDisplayedArticles([]);
    }
  }, [articles, searchQuery]);

  return (
    <div>
      <Head>
        <title>Hasil Pencarian untuk "{searchQuery}" - Literasi Digital</title>
        <meta name="description" content={`Hasil pencarian artikel tentang ${searchQuery}.`} />
      </Head>

      <main className="mx-auto px-4 sm:px-6 lg:px-12 py-10">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
          Hasil Pencarian untuk "{searchQuery}"
        </h2>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : displayedArticles.length === 0 ? (
          <p className="text-center text-gray-600">
            Tidak ada artikel yang cocok dengan "{searchQuery}".
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
