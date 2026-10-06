# AI Video Prompt Extractor V2 — Secure Web App

Versi ini memisahkan frontend dan API key. Browser hanya mengirim frame hasil ekstraksi ke endpoint `/api/analyze`; `OPENAI_API_KEY` disimpan sebagai environment variable di server.

## Jalankan lokal
1. Install Node.js 20+.
2. `npm install`
3. Salin `.env.example` menjadi `.env` dan isi `OPENAI_API_KEY`.
4. Jalankan `npm start`.
5. Buka `http://localhost:3000`.

## Deploy cepat ke Render
- Buat Web Service baru dari repository/folder ini.
- Build command: `npm install`
- Start command: `npm start`
- Environment variable: `OPENAI_API_KEY=...`
- Opsional: `OPENAI_MODEL=gpt-6-luna`

Setelah deploy, buka URL HTTPS dari HP. Chrome dapat menawarkan **Install app / Tambahkan ke layar utama** karena project menyertakan manifest dan service worker.

## Catatan keamanan
Jangan memasukkan API key ke `index.html` atau `app.js`. Jangan commit `.env`. Untuk penggunaan publik, tambahkan authentication/rate limiting dan pembatasan ukuran file.
