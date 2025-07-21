// pages/index.tsx

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { Article } from '../types';
import ArticleCard from '../components/Article/ArticleCard';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import ErrorMessage from '../components/Shared/ErrorMessage';
import LoadMoreButton from '../components/Article/LoadMoreButton';
import PaginationControls from '../components/Article/PaginationControls';
// Import ArticleFilter dan ArticleSortOrder. Pastikan path benar.
import ArticleFilter, { ArticleSortOrder } from '../components/Article/ArticleFilter';

// Constants for article quantities
const INITIAL_LOAD_LIMIT = 6; // Default articles displayed initially
const ARTICLES_PER_PAGE_PAGINATED = 9; // Number of articles per page after pagination mode is active

// Define a type for Author data
// Ini harus sesuai dengan struktur data yang dikembalikan oleh /api/public/authors
interface Author {
  id: number | ''; // ID dari database, atau '' untuk "Semua Penulis"
  name: string;
}

const HomePage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalArticles, setTotalArticles] = useState(0); // Total articles from the database

  // States to control display mode
  const [showMoreClicked, setShowMoreClicked] = useState(false); // True if "Show More" is clicked
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination

  // States for filter controls
  const [sortOrder, setSortOrder] = useState<ArticleSortOrder>('latest'); // State for sort order
  const [selectedSeriesSlug, setSelectedSeriesSlug] = useState<string>(''); // State for series filter
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | ''>(''); // State for author filter (using ID)
  const [startDate, setStartDate] = useState<string>(''); // State for start date filter
  const [endDate, setEndDate] = useState<string>(''); // State for end date filter

  // States for dynamic filter options (fetched from APIs)
  const [authors, setAuthors] = useState<Author[]>([]); // State to store fetched authors
  const [series, setSeries] = useState<{ slug: string; name: string }[]>([]); // State to store fetched series

  // Function to fetch articles from the API
  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let takeParam: number;
    let skipParam: number = 0;

    // Determine take and skip parameters based on display mode
    if (!showMoreClicked) {
      // Initial mode: 6 articles
      takeParam = INITIAL_LOAD_LIMIT;
    } else {
      // "Show More" mode or Pagination
      takeParam = ARTICLES_PER_PAGE_PAGINATED;
      skipParam = (currentPage - 1) * ARTICLES_PER_PAGE_PAGINATED;
    }

    // Build query parameters for filters
    const queryParams = new URLSearchParams();
    queryParams.append('take', String(takeParam));
    queryParams.append('skip', String(skipParam));
    queryParams.append('sortBy', sortOrder);

    if (selectedSeriesSlug) {
      queryParams.append('seriesSlug', selectedSeriesSlug);
    }
    if (selectedAuthorId !== '') { // Check for empty string for "Semua Penulis"
      queryParams.append('authorId', String(selectedAuthorId));
    }
    if (startDate) {
      queryParams.append('startDate', startDate);
    }
    if (endDate) {
      queryParams.append('endDate', endDate);
    }

    const apiUrl = `/api/public/articles?${queryParams.toString()}`;

    try {
      // Call the API with all parameters
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch article list.');
      }
      // API now returns an object { articles, totalArticles }
      const data = await response.json();
      setArticles(data.articles);
      setTotalArticles(data.totalArticles);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading articles.');
    } finally {
      setIsLoading(false);
    }
  }, [showMoreClicked, currentPage, sortOrder, selectedSeriesSlug, selectedAuthorId, startDate, endDate]);

  // Function to fetch authors dynamically for the filter dropdown
  const fetchAuthors = useCallback(async () => {
    try {
      const response = await fetch('/api/public/authors');
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API Error - Status: ${response.status}, Status Text: ${response.statusText}, Body: ${errorBody}`);
        throw new Error(`Failed to fetch authors. Server responded with ${response.status}: ${response.statusText}`);
      }
      const data: Author[] = await response.json();
      setAuthors(data);
    } catch (err: any) {
      console.error('Error fetching authors:', err);
      // Set error state for UI if fetching authors fails
      setError(err.message || 'Terjadi kesalahan saat memuat daftar penulis.');
    }
  }, []);

  // Function to fetch unique series slugs dynamically for the filter dropdown
  const fetchSeries = useCallback(async () => {
    try {
      const response = await fetch('/api/public/series'); // Panggil API baru untuk seri
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API Error - Status: ${response.status}, Status Text: ${response.statusText}, Body: ${errorBody}`);
        throw new Error(`Failed to fetch series. Server responded with ${response.status}: ${response.statusText}`);
      }
      const data: { slug: string; name: string }[] = await response.json();
      setSeries(data); // Set data seri yang sebenarnya
    } catch (err: any) {
      console.error('Error fetching series:', err);
      setError(err.message || 'Terjadi kesalahan saat memuat daftar seri.');
    }
  }, []);


  // Effect to load articles when the component is first rendered or filter states change
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Effect to load authors and series when component mounts
  useEffect(() => {
    fetchAuthors();
    fetchSeries(); // Panggil fetchSeries
  }, [fetchAuthors, fetchSeries]); // Tambahkan fetchSeries sebagai dependency

  // Handler for the "Show More" button
  const handleShowMore = () => {
    setShowMoreClicked(true);
    setCurrentPage(1); // Reset to page 1 when "Show More" is clicked
  };

  // Handlers for filter changes (these will be passed down to ArticleFilter)
  const handleSortChange = (newSortOrder: ArticleSortOrder) => {
    setSortOrder(newSortOrder);
    setShowMoreClicked(false); // Reset display mode when filter changes
    setCurrentPage(1); // Reset pagination when filter changes
  };

  const handleSeriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeriesSlug(e.target.value);
    setShowMoreClicked(false);
    setCurrentPage(1);
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedAuthorId(value === '' ? '' : Number(value)); // Convert to number if not empty string
    setShowMoreClicked(false);
    setCurrentPage(1);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setShowMoreClicked(false);
    setCurrentPage(1);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setShowMoreClicked(false);
    setCurrentPage(1);
  };

  // Pagination logic
  let totalPages: number;
  if (!showMoreClicked) {
    totalPages = 1;
  } else {
    totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE_PAGINATED);
  }

  const showPagination = showMoreClicked && totalPages > 1;

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <Head>
        <title>Literasi Digital - Beranda</title>
        <meta name="description" content="Kumpulan artikel tentang literasi digital." />
      </Head>

      {/* Hero Section with enhanced animated background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 mb-16">
        {/* Enhanced animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Primary floating orbs */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-gradient-to-br from-blue-200/40 to-indigo-300/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-purple-200/40 to-pink-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-cyan-200/30 to-blue-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Secondary floating elements */}
          <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-violet-200/25 to-purple-300/25 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-gradient-to-br from-teal-200/25 to-cyan-300/25 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-black text-gray-800 mb-6 tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Artikel Terbaru
              </span>
            </h1>
            <div className="relative">
              <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
                Temukan wawasan terbaru tentang teknologi digital dan literasi untuk masa depan yang lebih baik
              </p>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full opacity-60"></div>
            </div>
          </div>

          {/* Enhanced decorative elements */}
          <div className="flex justify-center items-center space-x-4 mt-12">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
            <div className="w-3 h-3 bg-gradient-to-r from-rose-400 to-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.8s' }}></div>
          </div>
        </div>
      </div>

      <main className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced filter section with glassmorphism */}
        <div className="-mt-16 mb-16">
          <div className="relative group max-w-full mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-2 transition-all duration-500 hover:shadow-3xl hover:bg-white/95 hover:border-white/30">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-11/12 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-3xl"></div>
              <ArticleFilter
                currentSort={sortOrder}
                onSortChange={handleSortChange}
                selectedSeriesSlug={selectedSeriesSlug}
                onSeriesChange={handleSeriesChange}
                seriesOptions={series}
                selectedAuthorId={selectedAuthorId}
                onAuthorChange={handleAuthorChange}
                authorOptions={authors}
                startDate={startDate}
                onStartDateChange={handleStartDateChange}
                endDate={endDate}
                onEndDateChange={handleEndDateChange}
              />
            </div>
          </div>
        </div>

        {/* Content section with enhanced styling */}
        <div className="relative">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[500px]">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                  <LoadingSpinner />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center min-h-[500px]">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur opacity-25"></div>
                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
                  <ErrorMessage message={error} />
                </div>
              </div>
            </div>
          ) : articles.length === 0 && totalArticles === 0 ? (
            <div className="text-center py-24">
              <div className="relative group max-w-lg mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full blur-lg"></div>
                    <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Belum ada artikel yang tersedia</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Artikel akan muncul setelah dipublikasikan. Silakan kembali lagi nanti untuk membaca konten terbaru.
                  </p>
                  <div className="mt-6 flex justify-center">
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Articles grid: Changed to display 3 columns on large screens and above */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
                {articles.map((article, index) => (
                  <div
                    key={article.id}
                    className="group relative transform transition-all duration-500 hover:scale-105"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.8s ease-out forwards'
                    }}
                  >
                    {/* Enhanced glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    
                    {/* Enhanced card wrapper */}
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:bg-white/95 group-hover:border-white/30">
                      {/* Top gradient border */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <ArticleCard article={article} />
                      
                      {/* Bottom gradient border */}
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Load More Button */}
              {!showMoreClicked && totalArticles > INITIAL_LOAD_LIMIT && (
                <div className="text-center">
                  {/* Container for the button and its blur effect */}
                  <div className="relative group inline-flex items-center justify-center py-1 px-2 rounded-xl"> {/* Added py-4 px-8, inline-flex, items-center, justify-center */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                    <div className="relative z-10"> {/* Ensure button is above the blur */}
                      <LoadMoreButton onClick={handleShowMore} isVisible={true} />
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Pagination */}
              {showPagination && (
                <div className="flex justify-center">
                  {/* Container for the pagination box and its blur effect */}
                  <div className="relative group py-1 px-2 rounded-xl flex items-center justify-center"> {/* Added py-1 px-2, flex, items-center, justify-center */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                    <div className="relative z-10 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 p-2"> {/* z-10 to bring to front, p-2 for inner padding */}
                      <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onNextPage={handleNextPage}
                        onPrevPage={handlePrevPage}
                        isVisible={true}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Enhanced background overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-100/10 to-indigo-100/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-100/10 to-pink-100/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        /* Enhanced shadow utilities */
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default HomePage;
