# 🎓 E-Ujian Online — Simulasi Komputasi Pervasif

Mini Online Exam Platform dengan fitur pengawasan cerdas berbasis Web API.

## 📁 Struktur Folder

```
eujian/
├── index.html          ← Halaman Login
├── exam.html           ← Halaman Ujian
├── result.html         ← Halaman Hasil
├── css/
│   └── style.css       ← Semua styling
├── js/
│   ├── login.js        ← Logika login + baca Excel
│   ├── questions.js    ← Bank soal (5 soal PG)
│   ├── exam.js         ← Logika ujian + fitur pervasif
│   └── result.js       ← Tampilkan hasil & log
└── data/
    └── mahasiswa.xlsx  ← Database mahasiswa (bisa diedit)
```

## 🚀 Cara Menjalankan

1. Buka file `index.html` di browser (Chrome/Firefox/Edge)
2. Klik tombol upload, pilih file `data/mahasiswa.xlsx`
3. Masukkan NIM dan Password dari tabel berikut:

## 👥 Data Mahasiswa Default

| NIM       | Nama             | Password  | Jurusan               |
|-----------|------------------|-----------|-----------------------|
| 12345001  | Andi Pratama     | andi123   | Teknik Informatika    |
| 12345002  | Budi Santoso     | budi456   | Sistem Informasi      |
| 12345003  | Citra Dewi       | citra789  | Teknik Informatika    |
| 12345004  | Dian Rahayu      | dian321   | Manajemen Informatika |
| 12345005  | Eko Wahyudi      | eko654    | Sistem Informasi      |
| 12345007  | Galih Permana    | galih111  | Sistem Informasi      |
| 12345008  | Hani Lestari     | hani222   | Manajemen Informatika |

> ⚠️ NIM 12345006 (Fitri) berstatus **nonaktif**, tidak bisa login.

## 🧠 Fitur Pervasif yang Diimplementasikan

### 1. Tab Visibility Monitor (Anti-Cheating)
- Menggunakan **Page Visibility API** (`document.visibilitychange`)
- Mendeteksi jika pengguna berpindah tab browser
- Menampilkan peringatan visual dan log pelanggaran
- **Otomatis mengunci ujian** jika pindah tab ≥ 3 kali

### 2. User Inactivity / Idle Detector (Presence Tracker)
- Memantau event `mousemove`, `keydown`, `touchstart`
- Pengguna dianggap AFK jika tidak ada aktivitas selama **20 detik**
- **Timer ujian otomatis dijeda** saat AFK
- Status bar berubah menjadi "User is Away From Keyboard"
- Timer dilanjutkan saat pengguna aktif kembali

## ✏️ Cara Menambah Mahasiswa di Excel

Buka `data/mahasiswa.xlsx` dan tambahkan baris baru dengan format:
```
NIM | Nama | Password | Jurusan | Status(aktif/nonaktif)
```

## 📝 Cara Mengubah Soal

Edit file `js/questions.js` — tambah/ubah objek dalam array `QUESTIONS`:
```javascript
{
  id: 6,
  text: "Pertanyaan baru?",
  options: ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
  answer: 0,  // Index jawaban benar (0=A, 1=B, 2=C, 3=D)
  explanation: "Penjelasan jawaban benar."
}
```
