// components/Article/ArticleCard.tsx
import React from 'react';
import Link from 'next/link';
import { Article } from '../../types';
import { getArticlePreview } from '../../utils/textProcessors'; // <<< IMPORT FUNGSI INI

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  // Panggil fungsi getArticlePreview untuk mendapatkan teks yang bersih dan dipotong
  // Anda bisa sesuaikan nilai 180 sesuai kebutuhan panjang preview Anda
  const previewText = getArticlePreview(article.content, 180); // <<< GUNAKAN FUNGSI DI SINI

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Gradient overlay for subtle visual interest */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6">
        {/* Title with improved typography */}
        {/* PERUBAHAN: Mengubah line-clamp-2 menjadi line-clamp-1 untuk judul */}
        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-blue-900 transition-colors duration-200">
          {article.title}
        </h2>

        {/* Enhanced metadata section */}
        <div className="flex items-center text-sm text-gray-500 mb-4 space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            {new Date(article.createdAt).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className="text-gray-300">•</span>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium text-gray-700">
              {article.author?.name || article.author?.email || 'Admin'}
            </span>
          </div>
        </div>

        {/* Content preview with better spacing */}
        <p className="text-gray-600 leading-relaxed line-clamp-3 mb-6 min-h-[72px]">
          {previewText} {/* <<< GUNAKAN VARIABEL previewText DI SINI */}
        </p>

        {/* Enhanced call-to-action button */}
        <Link href={`/articles/${article.id}`} className="group/link inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <span>Baca Selengkapnya</span>
          <svg className="ml-2 w-4 h-4 transform group-hover/link:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* Subtle bottom border accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </div>
  );
};

export default ArticleCard;
