// components/ArticleListSection.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Article } from '../types';
import { stripHtmlTags, getArticlePreview } from '../utils/textProcessors';

interface ArticleListSectionProps {
  articles: Article[];
  isLoadingArticles: boolean;
  editingArticleId: number | null;
  deletingArticleId: number | null;
  confirmingDeleteArticleId: number | null;
  setEditingArticleId: (id: number | null) => void;
  handleDelete: (id: number, title: string) => void;
  onEditClick: () => void;
}

export default function ArticleListSection({
  articles,
  isLoadingArticles,
  editingArticleId,
  deletingArticleId,
  confirmingDeleteArticleId,
  setEditingArticleId,
  handleDelete,
  onEditClick,
}: ArticleListSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrollingToEdit, setIsScrollingToEdit] = useState<number | null>(null);

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 5; // Maksimal 5 artikel per halaman

  // Filter dan urutkan artikel berdasarkan searchQuery dengan prioritas
  const filteredArticles = useMemo(() => {
    setCurrentPage(1); // Reset halaman ke 1 setiap kali query pencarian berubah
    
    if (!searchQuery) {
      return articles;
    }

    const lowerCaseSearchQuery = searchQuery.toLowerCase();
    
    // Pisahkan artikel berdasarkan di mana kecocokan ditemukan
    const titleMatches: Article[] = [];
    const contentOnlyMatches: Article[] = [];
    
    articles.forEach(article => {
      const titleMatches_bool = article.title.toLowerCase().includes(lowerCaseSearchQuery);
      const contentMatches_bool = stripHtmlTags(article.content).toLowerCase().includes(lowerCaseSearchQuery);
      
      if (titleMatches_bool) {
        // Jika cocok di judul, masukkan ke prioritas tinggi
        titleMatches.push(article);
      } else if (contentMatches_bool) {
        // Jika hanya cocok di konten, masukkan ke prioritas rendah
        contentOnlyMatches.push(article);
      }
    });
    
    // Gabungkan hasil dengan prioritas: judul dulu, kemudian konten
    return [...titleMatches, ...contentOnlyMatches];
  }, [articles, searchQuery]);

  // Hitung total halaman
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  // Dapatkan artikel untuk halaman saat ini
  const currentArticles = useMemo(() => {
    const indexOfLastArticle = currentPage * articlesPerPage;
    const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
    return filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  }, [filteredArticles, currentPage, articlesPerPage]);

  // Handler untuk navigasi halaman
  const handleNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleEditClick = (articleId: number) => {
    setIsScrollingToEdit(articleId);
    setEditingArticleId(articleId);
    onEditClick();
    
    setTimeout(() => {
      setIsScrollingToEdit(null);
    }, 500);
  };

  const getAuthorName = (article: Article): string => {
    if (!article.author) {
      return 'Admin';
    }
    
    const author = article.author;
    
    if (author.name && author.name.trim() !== '') {
      return author.name;
    }
    
    if (author.email && author.email.trim() !== '') {
      const emailName = author.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    
    return 'Admin';
  };

  // Fungsi untuk highlight teks yang cocok dengan query pencarian
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100/50 p-8 flex flex-col border border-gray-100/50 h-[970px] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center space-x-4 mb-8">
        <div className={`relative ${isLoadingArticles ? 'hidden' : ''}`}>
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center animate-slight-spin">
            <svg className="w-6 h-6 text-white transform -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
        </div>
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📋</span>
            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
              Daftar Artikel
            </h3>
          </div>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Kelola semua artikel Anda
            {searchQuery && (
              <span className="ml-2 text-indigo-600">
                ({filteredArticles.length} hasil untuk "{searchQuery}")
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Cari artikel berdasarkan judul atau konten..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isLoadingArticles ? (
        <div className="text-center py-16">
          <div className="relative mx-auto mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 mx-auto"></div>  
          </div>
          <p className="text-gray-600 font-medium">Memuat artikel...</p>
          <p className="text-gray-400 text-sm mt-1">Mohon tunggu sebentar</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-16">
          <div className="relative mx-auto mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <span className="text-4xl">📄</span>
            </div>
          </div>
          <h4 className="text-xl font-bold text-gray-700 mb-2">
            {searchQuery ? `Tidak ada artikel yang cocok dengan "${searchQuery}".` : 'Belum ada artikel yang dipublikasikan.'}
          </h4>
          <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
            {searchQuery ? 'Coba kueri pencarian lain atau tambahkan artikel baru.' : 'Mulai perjalanan menulis Anda dengan menambahkan artikel pertama!'}
          </p>
        </div>
      ) : (
        <>
          {/* Articles List */}
          <div className="space-y-4 max-h-[735px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-gray-100 pr-2">
            {currentArticles.map((article, index) => {
              // Tentukan apakah artikel ini cocok di judul atau hanya di konten
              const titleMatches = searchQuery ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) : false;
              const contentMatches = searchQuery ? stripHtmlTags(article.content).toLowerCase().includes(searchQuery.toLowerCase()) : false;
              
              return (
                <div
                  key={article.id}
                  className={`group relative bg-gradient-to-br from-white via-gray-50/50 to-indigo-50/30 rounded-2xl p-4 sm:p-6 border transition-all duration-300 transform hover:-translate-y-1 ${
                    titleMatches && searchQuery 
                      ? 'border-yellow-300/80 hover:border-yellow-400/80 hover:shadow-xl hover:shadow-yellow-100/50' 
                      : 'border-gray-200/60 hover:border-indigo-300/60 hover:shadow-xl hover:shadow-indigo-100/30'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative z-10">
                    <div className="flex-1 pr-0 sm:pr-4 mb-4 sm:mb-0">
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-4">
                        <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-sm">
                          <span className="mr-0.5 sm:mr-1">🏷️</span>
                          #{article.order}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
                          <span className="mr-0.5 sm:mr-1">📚</span>
                          {article.seriesSlug}
                        </span>
                        {titleMatches && searchQuery && (
                          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-sm">
                            <span className="mr-0.5 sm:mr-1">⭐</span>
                            Judul
                          </span>
                        )}
                      </div>
                      
                      <h4 
                        className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 group-hover:text-indigo-800 transition-colors duration-200"
                        dangerouslySetInnerHTML={{
                          __html: searchQuery ? highlightSearchTerm(article.title, searchQuery) : article.title
                        }}
                      />
                      
                      <p 
                        className="text-gray-600 line-clamp-3 leading-relaxed text-xs sm:text-sm mb-3"
                        dangerouslySetInnerHTML={{
                          __html: searchQuery ? highlightSearchTerm(getArticlePreview(article.content, 200), searchQuery) : getArticlePreview(article.content, 200)
                        }}
                      />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-600">
                            {new Date(article.createdAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <span className="hidden sm:inline text-gray-300">•</span>
                        
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium text-gray-700">
                            {article.author?.name || article.author?.email || 'Admin'}
                          </span>
                        </div>
                        
                        <span className="hidden sm:inline text-gray-300">•</span>
                        
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span className="text-gray-600">
                            {getArticlePreview(article.content, Infinity).length} karakter
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-3 mt-4 sm:mt-0 ml-0 sm:ml-4 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleEditClick(article.id)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center p-2 sm:px-4 sm:py-2.5 border border-transparent text-sm font-semibold rounded-xl text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                          deletingArticleId !== null ||
                          confirmingDeleteArticleId !== null ||
                          editingArticleId === article.id ||
                          isScrollingToEdit === article.id
                        }
                      >
                        {isScrollingToEdit === article.id ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 sm:h-4 sm:w-4 sm:mr-2"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span className="hidden sm:inline">Memuat...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5 sm:mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            <span className="hidden sm:inline">Edit</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(article.id, article.title)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center p-2 sm:px-4 sm:py-2.5 border border-transparent text-sm font-semibold rounded-xl text-red-700 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                          deletingArticleId === article.id ||
                          confirmingDeleteArticleId !== null ||
                          editingArticleId !== null ||
                          isScrollingToEdit !== null
                        }
                      >
                        {deletingArticleId === article.id ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 sm:h-4 sm:w-4 sm:mr-2 text-red-700"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span className="hidden sm:inline">Menghapus...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5 sm:mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            <span className="hidden sm:inline">Hapus</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-6">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-3 rounded-full bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
                aria-label="Halaman Sebelumnya"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <span className="text-lg font-medium text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-3 rounded-full bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
                aria-label="Halaman Berikutnya"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Custom Styles for Animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thumb-indigo-300::-webkit-scrollbar-thumb {
          background-color: #a5b4fc;
          border-radius: 3px;
        }
        
        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background-color: #f3f4f6;
          border-radius: 3px;
        }

        mark {
          background-color: #fef3c7;
          padding: 2px 4px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}