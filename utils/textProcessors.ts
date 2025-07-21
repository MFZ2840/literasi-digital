// utils/textProcessors.ts

/**
 * Menghapus semua tag HTML dan entitas HTML tertentu dari sebuah string.
 * @param htmlString String HTML yang akan dibersihkan.
 * @returns String teks bersih tanpa tag HTML atau entitas yang tidak diinginkan.
 */
export function stripHtmlTags(htmlString: string): string {
  if (!htmlString) return '';

  let cleanedString = htmlString;

  // 1. Hapus semua tag HTML (misal <p>, <strong>, <ul>, <li>)
  cleanedString = cleanedString.replace(/<[^>]*>/g, '');

  // 2. Ganti &nbsp; dengan spasi biasa
  cleanedString = cleanedString.replace(/&nbsp;/g, ' ');

  // 3. Hapus spasi ganda yang mungkin muncul setelah penghapusan tag/entitas
  // dan trim untuk menghilangkan spasi di awal/akhir
  cleanedString = cleanedString.replace(/\s\s+/g, ' ').trim();

  return cleanedString;
}

/**
 * Memotong teks ke panjang maksimum tertentu dan menambahkan elipsis jika dipotong.
 * @param text String teks yang akan dipotong.
 * @param maxLength Panjang maksimum teks yang diinginkan.
 * @returns String teks yang sudah dipotong.
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  // Temukan spasi terakhir sebelum atau pada maxLength untuk menghindari pemotongan kata
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  if (lastSpaceIndex !== -1 && lastSpaceIndex > maxLength * 0.8) { // Misalnya, dalam 20% terakhir dari maxLength
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  return truncated + '...';
}

/**
 * Menggabungkan stripHtmlTags dan truncateText untuk pratinjau artikel.
 * @param htmlContent Konten HTML artikel.
 * @param previewLength Panjang pratinjau yang diinginkan.
 * @returns Teks pratinjau yang bersih dan dipotong.
 */
export function getArticlePreview(htmlContent: string, previewLength: number = 150): string {
  const stripped = stripHtmlTags(htmlContent);
  return truncateText(stripped, previewLength);
}
