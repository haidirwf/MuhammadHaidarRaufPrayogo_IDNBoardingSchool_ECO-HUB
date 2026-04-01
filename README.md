# README

## Informasi Peserta
- Nama peserta: Muhammad Haidar Rauf Prayogo
- Asal sekolah/institusi: ITB-Stikom Bali
- Judul website: EcoSense - Smart Mobility & City Insights

## Deskripsi Singkat Website
EcoSense adalah website edukasi dan simulasi lingkungan yang membantu pengguna memahami dampak emisi perjalanan harian, memantau kualitas udara kota, serta melaporkan isu lingkungan secara interaktif berbasis peta.

Fitur utama:
- Smart Mobility Simulation (pilih titik asal dan tujuan di peta, lalu hitung emisi)
- Dashboard kondisi kota (AQI, PM2.5, PM10, kelembapan, dan ringkasan laporan)
- Form pelaporan isu lingkungan berbasis lokasi
- Rekomendasi aksi hijau dan pelacakan dampak pengguna
- Konten edukasi lingkungan

## Teknologi
- HTML5
- CSS3
- JavaScript (Vanilla)
- Leaflet.js

## Cara Menjalankan Proyek
### 1) Prasyarat
- Sudah terpasang Python 3 (untuk menjalankan local server sederhana)

### 2) Jalankan di lokal
Buka terminal di folder proyek:

```powershell
cd C:\Users\idal\sekolajh\eco-hub
python -m http.server 8080
```

Lalu buka di browser:
- `http://localhost:8080`

### 3) Jalankan di jaringan yang sama (opsional, untuk buka dari HP)
Cari IP laptop:

```powershell
ipconfig
```

Buka dari perangkat lain pada Wi-Fi yang sama:
- `http://<IP-LAPTOP>:8080`

Contoh:
- `http://192.168.1.10:8080`

## Catatan
- Proyek ini berbasis frontend statis (tanpa backend server khusus).
- Beberapa fitur (Service Worker dan manifest) bekerja optimal saat dijalankan via `http/https`, bukan langsung `file://`.
