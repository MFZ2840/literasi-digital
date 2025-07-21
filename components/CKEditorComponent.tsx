// components/CKEditorComponent.tsx
// Pastikan ini ada di baris paling atas jika Anda menggunakan App Router (Next.js 13+).
// Jika Anda masih di Pages Router (seperti terlihat dari pages/_app.tsx), ini tidak wajib tetapi tidak ada salahnya.
'use client';

import React, { useEffect, useState } from 'react';
// Import CKEditor dari paket react-nya
import { CKEditor } from '@ckeditor/ckeditor5-react';
// Import build editor klasik
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface CKEditorComponentProps {
  initialData?: string; // Data awal yang akan ditampilkan di editor
  onChange?: (data: string) => void; // Callback ketika konten editor berubah
}

const CKEditorComponent: React.FC<CKEditorComponentProps> = ({ initialData = '', onChange }) => {
  // State untuk menandai apakah komponen editor sudah siap dimuat (di sisi klien)
  const [editorLoaded, setEditorLoaded] = useState(false);

  useEffect(() => {
    // Set editorLoaded menjadi true setelah komponen ter-mount di sisi klien
    // Ini memastikan kode CKEditor hanya dieksekusi di browser
    setEditorLoaded(true);

    // Cleanup: Saat komponen di-unmount, pastikan instance editor dihancurkan
    return () => {
      // Tidak ada instance editor yang persisten di luar komponen jika dimuat dinamis
      // Namun, ini praktik bagus untuk membersihkan jika ada skenario khusus
      // di mana instance editor bisa tetap aktif.
    };
  }, []);

  // Tampilkan pesan loading atau placeholder selama editor belum dimuat
  if (!editorLoaded) {
    return <div>Loading editor...</div>;
  }

  return (
    <CKEditor
      editor={ClassicEditor} // Gunakan build editor klasik
      data={initialData}     // Set data awal editor

      onReady={(editor: any) => {
        // Callback ketika editor selesai diinisialisasi
        console.log('Editor is ready to use!', editor);
      }}
      onChange={(event: any, editor: any) => {
        // Callback ketika konten editor berubah
        const data = editor.getData();
        if (onChange) {
          onChange(data); // Panggil callback onChange yang diberikan dari parent
        }
      }}
      onBlur={(event: any, editor: any) => {
        // console.log('Blur.', editor);
      }}
      onFocus={(event: any, editor: any) => {
        // console.log('Focus.', editor);
      }}
      // Jika Anda menggunakan CKEditor versi 44.0.0 atau lebih baru,
      // Anda mungkin perlu menambahkan licenseKey di sini:
      // licenseKey="YOUR_LICENSE_KEY"
    />
  );
};

export default CKEditorComponent;