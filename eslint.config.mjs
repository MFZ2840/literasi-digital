// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({ // Menggunakan compat.config
    extends: [
      "next/core-web-vitals", // Mempertahankan ekstensi yang sudah ada
      "next/typescript"     // Mempertahankan ekstensi yang sudah ada
    ],
    rules: {
      'react/no-unescaped-entities': 'off', // Menambahkan aturan yang dinonaktifkan
      '@next/next/no-page-custom-font': 'off', // Menambahkan aturan yang dinonaktifkan
    },
  }),
];

export default eslintConfig;