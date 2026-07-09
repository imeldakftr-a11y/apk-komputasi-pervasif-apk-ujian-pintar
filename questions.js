// ===== QUESTIONS.JS =====
// Bank soal pilihan ganda — bisa diubah sesuai materi kuliah

const QUESTIONS = [
  {
    id: 1,
    text: "Apa yang dimaksud dengan Pervasive Computing (Komputasi Pervasif)?",
    options: [
      "Komputer yang hanya digunakan di server pusat",
      "Komputasi yang menyatu dengan lingkungan sehari-hari dan tidak terlihat oleh pengguna",
      "Teknologi komputasi yang membutuhkan koneksi internet terus-menerus",
      "Sistem operasi berbasis cloud yang diakses dari browser"
    ],
    answer: 1,
    explanation: "Pervasive Computing (juga disebut ubiquitous computing) adalah konsep integrasi teknologi komputer ke dalam lingkungan sehari-hari sehingga tidak terlihat mengganggu."
  },
  {
    id: 2,
    text: "Web API manakah yang digunakan untuk mendeteksi apakah pengguna berpindah tab atau meminimalkan browser?",
    options: [
      "Geolocation API",
      "Web Storage API",
      "Page Visibility API",
      "Notification API"
    ],
    answer: 2,
    explanation: "Page Visibility API menyediakan properti document.hidden dan event visibilitychange untuk mendeteksi perubahan visibilitas halaman."
  },
  {
    id: 3,
    text: "Dalam konteks Context-Aware Computing, apa yang dimaksud dengan 'context' (konteks)?",
    options: [
      "Bahasa pemrograman yang digunakan untuk membangun aplikasi",
      "Setiap informasi yang dapat digunakan untuk mengkarakterisasi situasi entitas (pengguna, tempat, objek)",
      "Database yang menyimpan preferensi pengguna",
      "Antarmuka pengguna yang responsif terhadap layar"
    ],
    answer: 1,
    explanation: "Menurut Dey (2001), konteks adalah informasi apa pun yang dapat digunakan untuk mengkarakterisasi situasi suatu entitas yang relevan bagi interaksi antara pengguna dan aplikasi."
  },
  {
    id: 4,
    text: "Event JavaScript apa yang paling tepat digunakan untuk membuat Idle/Inactivity Detector?",
    options: [
      "onclick dan onload",
      "mousemove, keydown, dan touchstart",
      "scroll dan resize",
      "focus dan blur"
    ],
    answer: 1,
    explanation: "Idle detector dibuat dengan memantau interaksi pengguna melalui event mousemove, keydown, dan touchstart. Jika tidak ada event ini dalam periode tertentu, pengguna dianggap idle/AFK."
  },
  {
    id: 5,
    text: "Teknologi mana yang merupakan contoh penerapan nyata Pervasive Computing dalam kehidupan sehari-hari?",
    options: [
      "Microsoft Word untuk pengetikan dokumen",
      "Smart home devices (lampu pintar, termostat otomatis) yang merespons kehadiran pengguna",
      "Website e-commerce yang dijual secara online",
      "Spreadsheet untuk mencatat keuangan"
    ],
    answer: 1,
    explanation: "Smart home devices adalah contoh klasik pervasive computing — teknologi menyatu dengan lingkungan dan merespons konteks pengguna (seperti kehadiran) secara otomatis."
  }
];
