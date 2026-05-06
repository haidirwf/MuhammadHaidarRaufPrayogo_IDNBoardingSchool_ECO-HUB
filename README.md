# Eco Hub

Website statis bertema lingkungan untuk simulasi mobilitas, insight kualitas udara, rekomendasi aksi hijau, dan kegiatan komunitas.

## Fitur Utama
- Simulasi mobilitas (pilih asal/tujuan di peta dummy, hitung estimasi emisi)
- Dashboard kota (AQI, PM2.5, PM10, kelembapan, dan skor area)
- Peta aksi komunitas dan daftar kegiatan warga
- Rekomendasi aksi hijau berbasis hasil simulasi
- Halaman konten edukasi lingkungan

## Teknologi
- HTML5
- CSS3
- JavaScript (Vanilla)
- Font Awesome 5.15.1
- Google Fonts

Catatan: peta berjalan dengan fallback native (tanpa Leaflet/OpenStreetMap).

## Struktur Singkat
- `index.html` : halaman utama + simulasi mobilitas
- `kegiatan.html` : halaman kegiatan komunitas
- `konten.html`, `fitur.html`, `about.html`, `artikel.html` : halaman konten
- `css/` : stylesheet global, komponen, dan halaman
- `js/` : logic interaktif frontend

## Cara Menjalankan
1. Buka terminal di folder proyek:
```powershell
cd C:\Users\idal\sekolajh\eco-hub
```
2. Jalankan server lokal:
```powershell
python -m http.server 8080
```
3. Buka di browser:
- `http://localhost:8080`

## Catatan
- Proyek ini frontend-only (tanpa backend khusus).
- Service worker dan manifest bekerja lebih baik melalui `http/https` daripada `file://`.
