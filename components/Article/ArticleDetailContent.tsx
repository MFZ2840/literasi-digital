// components/Article/ArticleDetailContent.tsx
import React from 'react';
import Link from 'next/link';
import { Article } from '../../types'; // PERUBAHAN: Import Article dari file types

interface ArticleDetailContentProps {
  article: Article;
}

const ArticleDetailContent: React.FC<ArticleDetailContentProps> = ({ article }) => {
  // Konten 'article.content' diasumsikan sudah aman dan disanitasi di backend
  const displayContent = article.content;

  return (
    <main className="w-full my-10">
      <article className="bg-white shadow-2xl overflow-hidden">
        {/* Header Section */}
        <header className="px-4 md:px-8 lg:px-12 xl:px-16 py-8 pb-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex items-center text-gray-600 text-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time className="font-medium">
                {new Date(article.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
            
            <div className="mx-3 text-gray-300">•</div>
            
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-semibold text-gray-800">
                {article.author?.name || article.author?.email || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.image && (
          <div className="relative overflow-hidden">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-auto object-contain transition-transform duration-300 hover:scale-105" 
              style={{ maxHeight: '80vh' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
          </div>
        )}

        {/* Content Section - INI BAGIAN UTAMA YANG BERUBAH */}
        <section className="px-4 md:px-8 lg:px-12 xl:px-16 py-8 pt-10">
          <div 
            className="prose prose-lg prose-gray max-w-none ck-content text-gray-800 leading-relaxed" 
            dangerouslySetInnerHTML={{ __html: displayContent }} 
          />
        </section>

        {/* Footer Navigation */}
        <footer className="px-4 md:px-8 lg:px-12 xl:px-16 py-8 pt-6 bg-gray-50 border-t border-gray-100">
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group"
          >
            <svg 
              className="mr-2 w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda
          </Link>
        </footer>
      </article>
    </main>
  );
};

export default ArticleDetailContent;
