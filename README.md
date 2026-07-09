# 🎓 E-Ujian Online — Simulasi Komputasi Pervasif

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Stack](https://img.shields.io/badge/stack-PHP%20%2B%20MySQL%20%2B%20JS-blue)
![License](https://img.shields.io/badge/license-education--use-lightgrey)

Platform ujian online mini dengan fitur **pengawasan cerdas berbasis Web API**
(Page Visibility API & Idle/Activity Detection), backend **PHP + MySQL** untuk
penyimpanan soal & hasil ujian secara terpusat, lengkap dengan **panel admin**
untuk dosen.


---

## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Struktur Folder](#-struktur-folder)
- [Cara Setup](#-cara-setup-wajib-sebelum-menjalankan)
- [Akses dari Perangkat Lain (LAN)](#-akses-dari-laptophp-lain-satu-jaringan-wifi)
- [Login & Data Mahasiswa](#-login--data-mahasiswa)
- [Login Admin](#-login-admin)
- [Fitur Pervasif & Anti-Kecurangan](#-fitur-pervasif--anti-kecurangan)
- [Kelola Soal & Hasil Ujian](#-kelola-soal--hasil-ujian-panel-admin)
- [Mode Offline / Fallback](#️-mode-offline--fallback)
- [Troubleshooting Singkat](#-troubleshooting-singkat)

---

## ✨ Fitur Utama

- 🔐 Login mahasiswa berbasis data Excel (`mahasiswa.xlsx`), bukan hardcode.
- 🗄️ Bank soal & hasil ujian tersimpan di **MySQL**, bukan `localStorage`.
- 🛠️ **Panel Admin**: CRUD soal, rekap hasil ujian, export CSV, kelola akun terblokir.
- 👁️ Deteksi pindah tab (Page Visibility API) → auto-blokir jika melewati batas.
- 😴 Deteksi idle/AFK (mouse, keyboard, touch) → timer otomatis dijeda / auto-submit.
- 🚫 Proteksi anti-copy, anti klik kanan, anti screenshot (best-effort).
- 🐱 Sesi jeda "Refreshing" resmi (3x, 10 detik) sebagai alternatif AFK yang legal.
- 🧭 Navigator soal belum terjawab + konfirmasi sebelum submit.
- 🌙 Mode terang/gelap.
- 📶 Fallback otomatis ke data/soal offline kalau server PHP/MySQL belum menyala.

---

## 📁 Struktur Folder

```
eujian_edit/
├── index.html          ← Halaman Login
├── rules.html           ← Halaman Peraturan (tampil setelah login)
├── exam.html            ← Halaman Ujian
├── result.html           ← Halaman Hasil & Review Jawaban
├── admin.html            ← Panel Admin Dosen (kelola soal + lihat hasil ujian)
├── api/
│   ├── config.php           ← Koneksi ke MySQL (host, user, password, nama DB)
│   ├── soal.php              ← REST API CRUD soal (GET / POST: add, update, delete, reset)
│   ├── hasil.php              ← REST API hasil ujian (GET / POST: save, clear)
│   └── default_questions.json ← Isi 5 soal default dipakai saat "Reset ke Default"
├── sql/
│   └── schema.sql        ← Import ini ke phpMyAdmin sebelum menjalankan aplikasi
├── css/
│   └── style.css, admin.css, result.css, rules.css
├── js/
│   ├── login.js       ← Logika login + baca data mahasiswa dari Excel
│   ├── questions.js   ← Ambil soal dari server (api/soal.php) + fallback offline
│   ├── admin.js       ← Logika panel admin: CRUD soal, lihat/export hasil, kelola blokir
│   ├── exam.js         ← Logika ujian: timer, anti-cheat, AFK detector, submit
│   ├── result.js       ← Tampilkan skor, pelanggaran, log, dan review jawaban
│   └── theme.js        ← Toggle mode terang/gelap
└── data/
    └── mahasiswa.xlsx  ← Database mahasiswa (bisa diedit langsung di Excel)
```

---

## 🚀 Cara Setup (WAJIB sebelum menjalankan)

1. Install **[XAMPP](https://www.apachefriends.org)** (kalau belum ada).
2. Copy folder `eujian_edit/` ke dalam folder `htdocs` XAMPP.
   - Windows: `C:\xampp\htdocs\eujian_edit`
   - Mac: `/Applications/XAMPP/htdocs/eujian_edit`
3. Buka **XAMPP Control Panel**, klik **Start** pada **Apache** dan **MySQL**.
4. Buka browser ke `http://localhost/phpmyadmin`.
5. Buat database baru bernama **`eujian_db`**.
6. Klik tab **Import**, pilih file `sql/schema.sql`, klik **Go**.
   Ini otomatis membuat tabel `soal` & `hasil_ujian`, plus mengisi 5 soal default.
7. Buka aplikasi lewat: `http://localhost/eujian_edit/index.html`

> ⚠️ **Jangan** dobel-klik file HTML langsung (`file://`) — API PHP dan pembacaan
> file Excel hanya berfungsi kalau diakses lewat server (`http://...`).

Kalau setting MySQL kamu beda dari default XAMPP (mis. ganti password root),
sesuaikan di `api/config.php`:

```php
$DB_HOST = "localhost";
$DB_USER = "root";
$DB_PASS = "";        // isi sesuai password MySQL kamu
$DB_NAME = "eujian_db";
```

---

## 🌐 Akses dari Laptop/HP Lain (satu jaringan WiFi)

1. Cari alamat IP komputer yang menjalankan XAMPP, misalnya `192.168.1.5`.
2. Siswa membuka browser ke `http://192.168.1.5/eujian_edit/index.html`.
3. Semua soal & hasil ujian otomatis tersimpan terpusat di database komputer host.

---

## 👥 Login & Data Mahasiswa

Login memakai **NIM + Nama** (bukan password), dicocokkan ke `data/mahasiswa.xlsx`.

Format kolom Excel:

```
NIM | Nama | Jurusan | Status (aktif/nonaktif)
```

Contoh data default (di `js/login.js`, dipakai kalau Excel gagal dimuat):

| NIM       | Nama             | Jurusan               | Status    |
|-----------|------------------|------------------------|-----------|
| 12345001  | Andi Pratama     | Teknik Informatika     | aktif     |
| 12345002  | Budi Santoso     | Sistem Informasi       | aktif     |
| 12345003  | Citra Dewi       | Teknik Informatika     | aktif     |
| 12345004  | Dian Rahayu      | Manajemen Informatika  | aktif     |
| 12345005  | Eko Wahyudi      | Sistem Informasi       | aktif     |
| 12345006  | Fitri Handayani  | Teknik Informatika     | nonaktif  |
| 12345007  | Galih Permana    | Sistem Informasi       | aktif     |
| 12345008  | Hani Lestari     | Manajemen Informatika  | aktif     |

> ⚠️ NIM `12345006` (Fitri) berstatus **nonaktif**, tidak bisa login.

Jika file Excel gagal dimuat (misal dibuka lewat `file://` atau tanpa internet
untuk memuat library XLSX dari CDN), aplikasi otomatis memakai daftar cadangan
di atas.

---

## 🔐 Login Admin

Buka `admin.html`, masukkan password default **`dosen123`**
(bisa diganti di `js/admin.js`, konstanta `ADMIN_PASSWORD`).

---

## 🧠 Fitur Pervasif & Anti-Kecurangan

| Fitur | Mekanisme | Detail Default |
|---|---|---|
| **Tab Visibility Monitor** | Page Visibility API (`visibilitychange`) | Maks **2x** pindah tab, lebih dari itu ujian **diblokir otomatis** |
| **Idle/AFK Detector** | Event `mousemove`, `keydown`, `touchstart`, `mousedown`, `scroll` | Idle ≥ **10 detik** → status AFK, timer dijeda, countdown **10 detik** sebelum auto-submit |
| **Anti-Copy** | Blokir `Ctrl+C/A/U/S`, klik kanan, `PrintScreen` | Menampilkan peringatan, tidak memblokir ujian |
| **Auto-Blokir & Blacklist** | `localStorage` (`blockedNIMs`) | NIM yang diblokir tidak bisa login ulang sampai dibuka lewat panel admin |
| **Sesi Refreshing Kucing 🐱** | Tombol jeda opsional | 3x kesempatan, masing-masing 10 detik, timer ujian ikut dijeda |
| **Navigator Soal Belum Dijawab** | Tombol mengambang (FAB) | Menampilkan daftar soal yang belum dijawab & tombol lompat ke soal tsb |
| **Konfirmasi Sebelum Submit** | Modal konfirmasi | Menampilkan jumlah soal yang belum dijawab sebelum submit final |

Durasi ujian default: **10 menit** (`EXAM_DURATION` di `js/exam.js`). Semua angka
di atas bisa diubah lewat konstanta `CONFIG` pada file yang sama.

---

## 📝 Kelola Soal & Hasil Ujian (Panel Admin)

Dari `admin.html`, dosen bisa:
- Tambah / edit / hapus soal lewat form (tanpa sentuh kode).
- Reset bank soal ke 5 soal default kapan saja.
- Lihat rekap hasil ujian seluruh mahasiswa (skor, benar/salah, pelanggaran, waktu, dll).
- Export hasil ujian ke CSV (bisa dibuka di Excel).
- Hapus semua data hasil ujian.
- Lihat & membuka blokir NIM yang terkena auto-blokir.

Semua data (soal & hasil ujian) tersimpan di database MySQL `eujian_db`, bukan di
kode maupun `localStorage` — sehingga benar-benar terpusat di server.

---

## ⚙️ Mode Offline / Fallback

Jika koneksi ke `api/soal.php` gagal (server PHP/MySQL belum menyala), aplikasi
otomatis memakai `DEFAULT_QUESTIONS` di `js/questions.js` agar ujian tetap bisa
dicoba. Hasil ujian yang gagal terkirim ke server juga disimpan cadangan di
`localStorage` (`examResultsOfflineBackup`) supaya tidak hilang.

---

## 🩹 Troubleshooting Singkat

| Masalah | Solusi Cepat |
|---|---|
| Halaman blank / gagal fetch data | Akses lewat `http://localhost/...`, jangan dobel-klik file HTML |
| "Gagal konek ke database" | Nyalakan Apache & MySQL di XAMPP, pastikan `eujian_db` sudah di-import |
| Soal balik ke versi lama | Server PHP tidak terjangkau → cek `api/soal.php` bisa diakses |
| Mahasiswa tidak bisa login padahal data benar | NIM ada di blacklist browser tsb → buka blokir lewat `admin.html` |



## 📖 Dokumentasi Lengkap

Untuk panduan penggunaan langkah-demi-langkah (mahasiswa & dosen), lihat **[MANUAL_BOOK.md](./MANUAL_BOOK.md)**.
