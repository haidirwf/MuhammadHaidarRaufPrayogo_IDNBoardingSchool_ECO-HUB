# Eco Hub

Website statis bertema lingkungan untuk simulasi mobilitas, insight kualitas udara, rekomendasi aksi hijau, dan kegiatan komunitas.

## Informasi Peserta
- Nama Peserta: `Muhammad Haidar Rauf Prayogo`
- Nomor Peserta: `001`
- Asal Sekolah/Institusi: `IDN Boarding School`
- Judul Website: `Eco Hub`
- Kategori Lomba: `Design Web SMA/SMK`

## Deskripsi Singkat Website
Eco Hub adalah website edukasi interaktif yang membantu pengguna memahami dampak mobilitas harian terhadap emisi karbon, melihat ringkasan kondisi udara kota, mengeksplor aksi komunitas, dan membaca konten edukasi lingkungan dalam satu pengalaman web statis.

## Fitur Utama
- Simulasi mobilitas (pilih asal/tujuan di peta fallback, hitung estimasi emisi)
- Dashboard kota (AQI, PM2.5, PM10, kelembapan, dan skor area)
- Peta aksi komunitas dan daftar kegiatan warga
- Rekomendasi aksi hijau berbasis hasil simulasi
- Halaman konten edukasi lingkungan

## Teknologi yang Digunakan
- HTML5
- CSS3
- JavaScript (Vanilla)
- Font Awesome 5.15.1 (diizinkan guidebook)
- Google Fonts (diizinkan guidebook)

Catatan implementasi:
- Tidak menggunakan framework frontend (React/Vue/Angular/Tailwind/Bootstrap).
- Tidak menggunakan Leaflet (sudah dihapus demi kepatuhan aturan library).
- Peta berjalan dengan fallback native berbasis HTML/CSS/JS.

## Struktur Proyek
- `index.html` : halaman utama + simulasi mobilitas + dashboard
- `kegiatan.html` : kegiatan komunitas
- `konten.html` : konten edukasi
- `fitur.html` : ringkasan fitur
- `about.html` : informasi proyek
- `artikel.html` : artikel edukasi
- `css/` : stylesheet global, komponen, dan per halaman
- `js/` : logika interaktif frontend
- `assets/` : aset ikon aplikasi

## Cara Menjalankan Proyek
1. Buka terminal pada folder proyek:
```powershell
cd C:\Users\idal\sekolajh\eco-hub
```
2. Jalankan server lokal:
```powershell
python -m http.server 8080
```
3. Buka browser:
- `http://localhost:8080`

## Catatan Pengumpulan (Sesuai TM)
- Jika pakai GitHub, repository harus `Public`.
- Sertakan file `README.md` (dokumen ini) saat pengumpulan via GitHub.
- Saat pengumpulan via Google Drive, pastikan folder diatur `Anyone with the link` + `Viewer`.
- Pastikan melampirkan dokumentasi screenshot tiap halaman (`File Dokumentasi.pdf`) sesuai ketentuan TM.
