// components/Article/ArticleFilter.tsx
import React, { useState } from 'react'; // Import useState

// Definisikan tipe untuk opsi penyortiran
export type ArticleSortOrder = 'latest' | 'oldest' | 'az' | 'za' | 'popular'; // Tambahkan 'popular'

// Define a type for Author data (sesuai dengan yang di fetch dari API)
interface Author {
  id: number | ''; // ID dari database, atau '' untuk "Semua Penulis"
  name: string;
}

interface ArticleFilterProps {
  currentSort: ArticleSortOrder;
  onSortChange: (sortOrder: ArticleSortOrder) => void;
  
  // Props baru untuk filter Seri
  selectedSeriesSlug: string;
  onSeriesChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  seriesOptions: { slug: string; name: string }[]; // Opsi seri dari parent
  
  // Props baru untuk filter Penulis
  selectedAuthorId: number | '';
  onAuthorChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  authorOptions: Author[]; // Opsi penulis dari parent
  
  // Props baru untuk filter Rentang Tanggal
  startDate: string;
  onStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  endDate: string;
  onEndDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ArticleFilter: React.FC<ArticleFilterProps> = ({
  currentSort,
  onSortChange,
  selectedSeriesSlug,
  onSeriesChange,
  seriesOptions,
  selectedAuthorId,
  onAuthorChange,
  authorOptions,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}) => {
  // State untuk mengontrol visibilitas filter di mobile
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fungsi untuk toggle visibilitas filter
  const toggleFilterVisibility = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    // Mengubah flex-wrap menjadi flex-col di mobile, dan flex-wrap di desktop
    // Menambahkan justify-center untuk tombol toggle di mobile
    <div className="flex flex-col md:flex-wrap justify-between items-center gap-4 py-4 px-4 sm:px-6">
      {/* Tombol untuk membuka/menutup filter (hanya terlihat di mobile) */}
      <button
        type="button"
        onClick={toggleFilterVisibility}
        className="md:hidden w-full px-6 py-3 bg-indigo-500 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 4h18v2l-7 7v7l-4-2v-5L3 6V4zm2.414 2L10 10.586V16l2 1v-6.414L16.586 6H5.414z"/>
        </svg>
        <span>{isFilterOpen ? 'Sembunyikan Filter' : 'Tampilkan Filter'}</span>
        <svg className={`w-4 h-4 transform transition-transform duration-500 ${isFilterOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Kontainer untuk semua filter input (tersembunyi di mobile secara default, terlihat di desktop) */}
      {/* Akan ditampilkan di mobile jika isFilterOpen true */}
      <div className={`w-full flex-col md:flex md:flex-row md:flex-wrap justify-between items-center gap-4 ${isFilterOpen ? 'flex' : 'hidden'}`}>
        {/* Sort Order Filter */}
        <div className="relative group w-full sm:w-auto flex-grow">
          <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-2">
            Sort by
          </label>
          <select
            id="sort-by"
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value as ArticleSortOrder)}
            className="block w-full pl-4 pr-10 py-3 text-base border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl shadow-sm bg-white text-gray-900 appearance-none transition-all duration-200 hover:border-gray-300 hover:shadow-md"
          >
            <option value="latest">📅 Latest</option>
            <option value="oldest">📅 Oldest</option>
            <option value="az">🔤 Title (A-Z)</option>
            <option value="za">🔤 Title (Z-A)</option>
            <option value="popular">🔥 Most Popular</option>
          </select>
          {/* PERUBAHAN: Menghapus pt-7 dari sini */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 pt-7 text-gray-500 group-hover:text-gray-700 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="relative group w-full sm:w-auto flex-grow">
          <label htmlFor="series-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Series
          </label>
          <select
            id="series-filter"
            value={selectedSeriesSlug}
            onChange={onSeriesChange}
            className="block w-full pl-4 pr-10 py-3 text-base border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl shadow-sm bg-white text-gray-900 appearance-none transition-all duration-200 hover:border-gray-300 hover:shadow-md"
          >
            {seriesOptions.map(s => (
              <option key={s.slug} value={s.slug}>📚 {s.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 pt-7 text-gray-500 group-hover:text-gray-700 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Author Filter */}
        <div className="relative group w-full sm:w-auto flex-grow">
          <label htmlFor="author-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Author
          </label>
          <select
            id="author-filter"
            value={selectedAuthorId}
            onChange={onAuthorChange}
            className="block w-full pl-4 pr-10 py-3 text-base border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl shadow-sm bg-white text-gray-900 appearance-none transition-all duration-200 hover:border-gray-300 hover:shadow-md"
          >
            {authorOptions.map(author => (
              <option key={author.id} value={author.id}>
                ✍️ {author.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 pt-7 text-gray-500 group-hover:text-gray-700 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-col gap-2 w-full sm:w-auto flex-grow">
          <span className="text-sm font-medium text-gray-700">Date Range</span>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative group w-full">
              <label htmlFor="start-date" className="sr-only">Tanggal Mulai</label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={onStartDateChange}
                className="block w-full px-4 py-3 text-base border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl shadow-sm bg-white text-gray-900 transition-all duration-200 hover:border-gray-300 hover:shadow-md"
                aria-label="Tanggal Mulai"
                placeholder="Dari"
              />
            </div>
            <div className="flex items-center px-2">
              <span className="text-gray-400 text-sm">—</span>
            </div>
            <div className="relative group w-full">
              <label htmlFor="end-date" className="sr-only">Tanggal Akhir</label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={onEndDateChange}
                className="block w-full px-4 py-3 text-base border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl shadow-sm bg-white text-gray-900 transition-all duration-200 hover:border-gray-300 hover:shadow-md"
                aria-label="Tanggal Akhir"
                placeholder="Sampai"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleFilter;
