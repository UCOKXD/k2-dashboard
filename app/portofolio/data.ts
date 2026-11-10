// Isi halaman portofolio (link di bio Instagram). Ubah teks di sini saja, tampilannya ada di page.tsx.
// Tata letak dan gerak meniru gaya situs inherited.band, dengan isi dan warna sendiri (warna kunci K2).
// Tautan yang dikosongkan ("") otomatis tidak ditampilkan.

export const PROFIL = {
  nama: "Francis Demetrio Villanova",
  panggilan: "Ancis",
  // Nama raksasa di layar pembuka, dipecah jadi beberapa potong yang direntang selebar layar.
  pecahan: ["FR", "AN", "CI", "S"],
  // Teks kecil berundak di bawah nama pembuka.
  sub: ["2026", "CLOUD", "CYBERSECURITY"],
  deskripsi:
    "Mahasiswa PPTI penerima beasiswa BCA di BINUS University. Fokus di Cloud Computing dan Cybersecurity, juga Public Speaking dan Digital Marketing.",
};

// Foto & gambar. Taruh file di public/portofolio/. Selama file belum ada, halaman menampilkan penanda.
export const MEDIA = {
  // Foto diri: tegak atau mendatar, wajah jelas, sekitar 1600 px. Dipakai di layar pembuka dan adegan "tentang".
  foto: "/portofolio/foto.jpg",
  // Tangkapan layar SINAU (persegi atau mendatar), jadi "cover" di bagian akhir.
  sinau: "/portofolio/sinau.webp",
  // Tangkapan layar Web K2 (sudah disiapkan).
  webK2Desktop: "/portofolio/web-k2-desktop.webp",
  webK2Hp: "/portofolio/web-k2-hp.webp",
};

// Isi username/alamat untuk menampilkan tautannya. Contoh: instagram: "usernamekamu"
export const KONTAK = {
  instagram: "",
  tiktok: "",
  linkedin: "",
  github: "UCOKXD",
  email: "",
};

// Kategori di layar kontak (seperti "Inquiries, Collaborations, Booking").
export const KONTAK_UNTUK = ["KOLABORASI", "PROYEK WEB", "PEMBICARA"];

// Tiga adegan layar penuh (seperti profil anggota band).
export const ADEGAN = {
  tentang: {
    id: "tentang",
    nama: ["FRANCIS", "VILLANOVA"],
    peran: ["MAHASISWA PPTI", "BEASISWA BCA", "KOORDINATOR K2"],
    tanda: "ID",
  },
  fokus: {
    id: "fokus",
    nama: ["CLOUD", "SECURITY"],
    peran: ["AWS · GOOGLE CLOUD", "DOCKER · LINUX", "PYTHON · C++ · PHP"],
    tanda: "2026",
    // Isi kartu terminal di tengah adegan.
    terminal: [
      { kunci: "cloud", nilai: "Cloud Computing" },
      { kunci: "security", nilai: "Cybersecurity" },
      { kunci: "speaking", nilai: "Public Speaking" },
      { kunci: "marketing", nilai: "Digital Marketing" },
      { kunci: "bahasa", nilai: "English, Indonesia" },
    ],
    // Logo di kartu terminal (file di public/portofolio/logo/). `putih` = logo bertulisan gelap, ditampilkan putih polos di atas navy.
    logo: [
      { nama: "AWS", file: "aws", putih: true },
      { nama: "Google Cloud", file: "google-cloud", putih: true },
      { nama: "Docker", file: "docker" },
      { nama: "Linux", file: "linux" },
      { nama: "Python", file: "python" },
      { nama: "C++", file: "cpp" },
      { nama: "PHP", file: "php" },
      { nama: "Node.js", file: "nodejs", putih: true },
      { nama: "MySQL", file: "mysql", putih: true },
      { nama: "HTML5", file: "html5" },
      { nama: "Figma", file: "figma" },
      { nama: "Claude", file: "claude", putih: true },
    ],
  },
  webK2: {
    id: "proyek",
    nama: ["WEB K2", "PPTI 28"],
    peran: ["PEMBUAT", "ADMIN WEBSITE", "NEXT.JS · VERCEL"],
    tanda: "34",
    tandaLabel: "pengguna",
    href: "/",
  },
};

// Bagian akhir bergaya "records": proyek yang sedang dikerjakan.
export const UNGGULAN = {
  id: "sinau",
  judul: [["SIAP", "NAMBAH"], ["ILMU"]],
  dari: "PROYEK YANG SEDANG DIKERJAKAN",
  nama: "SINAU",
  deskripsi: "Platform persiapan kuliah untuk siswa SMA/SMK dan mahasiswa baru: pretest kesiapan akademik, materi sesuai kebutuhan, streak belajar, dan asisten belajar NARA.",
  ajakan: "BUKA SINAU",
  href: "https://sinauproject.vercel.app/",
  tautan: [
    { label: "WEBSITE", href: "https://sinauproject.vercel.app/" },
    { label: "WEB K2", href: "/" },
  ],
};
