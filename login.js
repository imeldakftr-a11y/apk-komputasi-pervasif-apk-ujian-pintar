// ===== LOGIN.JS =====

// Data bawaan (dipakai sebagai fallback jika Excel gagal dimuat,
// misalnya saat index.html dibuka langsung dobel-klik tanpa Live Server)
const MAHASISWA_DB_FALLBACK = [
  { nim: "12345001",  nama: "Andi Pratama",    jurusan: "Teknik Informatika",    status: "aktif" },
  { nim: "12345002",  nama: "Budi Santoso",    jurusan: "Sistem Informasi",      status: "aktif" },
  { nim: "12345003",  nama: "Citra Dewi",      jurusan: "Teknik Informatika",    status: "aktif" },
  { nim: "12345004",  nama: "Dian Rahayu",     jurusan: "Manajemen Informatika", status: "aktif" },
  { nim: "12345005",  nama: "Eko Wahyudi",     jurusan: "Sistem Informasi",      status: "aktif" },
  { nim: "12345006",  nama: "Fitri Handayani", jurusan: "Teknik Informatika",    status: "nonaktif" },
  { nim: "12345007",  nama: "Galih Permana",   jurusan: "Sistem Informasi",      status: "aktif" },
  { nim: "12345008",  nama: "Hani Lestari",    jurusan: "Manajemen Informatika", status: "aktif" },
  { nim: "230741117", nama: "Imelda Kafitri",  jurusan: "Teknik Informatika",    status: "aktif" },
  { nim: "23074113",  nama: "Oca",             jurusan: "Teknik Informatika",    status: "aktif" },
  { nim: "230741112", nama: "Shella",          jurusan: "Teknik Informatika",    status: "aktif" },
];

let MAHASISWA_DB = MAHASISWA_DB_FALLBACK;
let dataLoaded   = false;

// ===== BACA DATA MAHASISWA DARI data/mahasiswa.xlsx =====
// Hanya berhasil jika halaman dibuka lewat server (Live Server, dsb),
// karena browser tidak izinkan fetch() file lokal lewat protokol file://
async function loadMahasiswaData() {
  const btn = document.getElementById('login-btn');
  try {
    if (typeof XLSX === 'undefined') {
      throw new Error('Library XLSX gagal dimuat (perlu koneksi internet untuk CDN).');
    }
    const res = await fetch('data/mahasiswa.xlsx');
    if (!res.ok) throw new Error('File Excel tidak ditemukan / tidak bisa diakses.');

    const buffer = await res.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const parsed = rows.map(r => ({
      nim:     String(r.NIM ?? r.nim ?? '').trim(),
      nama:    String(r.Nama ?? r.nama ?? '').trim(),
      jurusan: String(r.Jurusan ?? r.jurusan ?? '').trim(),
      status:  String(r.Status ?? r.status ?? 'aktif').trim().toLowerCase(),
    })).filter(m => m.nim && m.nama);

    if (parsed.length === 0) throw new Error('Data pada file Excel kosong.');

    MAHASISWA_DB = parsed;
    console.log(`✅ Data mahasiswa dimuat dari Excel (${MAHASISWA_DB.length} baris).`);
  } catch (err) {
    MAHASISWA_DB = MAHASISWA_DB_FALLBACK;
    console.warn('⚠️ Gagal memuat data dari Excel, memakai data bawaan. Alasan:', err.message);
  } finally {
    dataLoaded = true;
    if (btn) { btn.disabled = false; btn.textContent = 'Mulai Ujian 🚀'; }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('login-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Memuat data... ⏳'; }
  loadMahasiswaData();
});

// ===== CEK BLACKLIST localStorage =====
function isBlacklisted(nim) {
  const list = JSON.parse(localStorage.getItem('blockedNIMs') || '[]');
  return list.includes(nim);
}

function handleLogin() {
  if (!dataLoaded) { showError('⏳ Mohon tunggu, data mahasiswa masih dimuat...'); return; }

  const nim  = document.getElementById('nim').value.trim();
  const nama = document.getElementById('nama-input').value.trim().toLowerCase();

  if (!nim || !nama) { showError('⚠️ NIM dan Nama wajib diisi!'); return; }

  // Cek blacklist dulu
  if (isBlacklisted(nim)) {
    showError('🔒 Akun ini telah diblokir karena pelanggaran ujian. Hubungi pengawas.');
    return;
  }

  const mhs = MAHASISWA_DB.find(m => m.nim === nim && m.nama.toLowerCase() === nama);
  if (!mhs) { showError('❌ NIM atau Nama tidak ditemukan. Periksa kembali data Anda.'); return; }
  if (mhs.status !== 'aktif') { showError('🚫 Akun Anda tidak aktif. Hubungi administrator.'); return; }

  sessionStorage.setItem('currentUser', JSON.stringify({
    nim: mhs.nim, nama: mhs.nama, jurusan: mhs.jurusan,
    loginTime: new Date().toISOString(),
  }));
  window.location.href = 'rules.html';
}

document.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });

function showError(msg) {
  const el = document.getElementById('error-msg');
  el.textContent = msg; el.classList.remove('hidden');
}
