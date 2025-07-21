// components/DeleteConfirmationModal.tsx
import React from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, title, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    // PERUBAHAN: Menambahkan top-0, left-0, w-full, h-full secara eksplisit
    // dan memastikan z-index yang tinggi.
    <div className="fixed top-0 left-0 w-full h-full z-[9999] flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
      {/* Hapus opacity-0 dari div ini karena animate-scale-in sudah menanganinya */}
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto transform scale-95 animate-scale-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Konfirmasi Penghapusan</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <p className="text-gray-700 mb-6">
          Apakah Anda yakin ingin menghapus artikel: <strong className="font-semibold text-red-600">"{title}"</strong>?
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
