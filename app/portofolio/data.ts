// Isi halaman portofolio (link di bio Instagram). Ubah teks di sini saja, tampilannya ada di page.tsx.
// Tautan yang dikosongkan ("") otomatis tidak ditampilkan.

export const PROFIL = {
  nama: "Francis Demetrio Villanova",
  namaBesar: "FRANCIS", // nama raksasa di belakang foto
  panggilan: "Ancis",
  peran: "Mahasiswa PPTI, penerima beasiswa BCA",
  kampus: "BINUS University",
  kutipan: "Teknologi adalah tempat saya terus belajar, bereksplorasi, dan bertumbuh.",
  // Angka besar di kanan atas: nomor angkatan PPTI 28.
  angka: "28",
  angkaLabel: "Angkatan PPTI",
  // Foto potong (PNG latar transparan, tegak, sekitar 1200 px tinggi) taruh di public/portofolio/foto.png.
  // Selama belum ada, halaman menampilkan kotak penanda.
  foto: "/portofolio/foto.png",
};

export const TENTANG = [
  "Saya mahasiswa PPTI (Program Pendidikan Teknik Informatika) penerima beasiswa BCA di BINUS University. Fokus saya Cloud Computing dan Cybersecurity, ditambah Public Speaking dan Digital Marketing supaya ide teknis bisa sampai ke orang yang tepat.",
  "Saya cepat beradaptasi, berkomunikasi dengan asertif, dan siap memimpin dengan tanggung jawab. Sekarang saya Koordinator Divisi K2 sekaligus pembuat web kelas ABSORBING PPTI 28, dan sehari-hari terbiasa memakai Bahasa Inggris.",
];

// Baris "terminal" di kartu kiri bawah.
export const FOKUS = [
  { kunci: "cloud", nilai: "Cloud Computing" },
  { kunci: "security", nilai: "Cybersecurity" },
  { kunci: "speaking", nilai: "Public Speaking" },
  { kunci: "marketing", nilai: "Digital Marketing" },
];

// Isi username/alamat untuk menampilkan tautannya. Contoh: instagram: "usernamekamu"
export const KONTAK = {
  instagram: "",
  linkedin: "",
  github: "UCOKXD",
  email: "",
};

export type Proyek = {
  judul: string;
  peran: string;
  deskripsi: string;
  teknologi?: string;
  href?: string; // tautan di dalam situs ini (mis. "/") atau alamat lengkap
  hrefLabel?: string;
};

// Proyek pertama juga tampil di kartu kanan bawah poster.
export const PROYEK: Proyek[] = [
  {
    judul: "Web K2 PPTI 28",
    peran: "Pembuat dan admin website",
    deskripsi: "Pusat informasi untuk 34 mahasiswa kelas ABSORBING PPTI 28: jadwal, izin, pelanggaran, galeri, dan pesan anonim. Dibuat dan dikelola sendiri.",
    teknologi: "Next.js, Tailwind CSS, Vercel",
    href: "/",
    hrefLabel: "Buka web K2",
  },
  {
    judul: "SINAU",
    peran: "Pengembang",
    deskripsi: "Platform belajar untuk calon mahasiswa baru, dengan asesmen diagnostik untuk mengenali materi yang perlu diperkuat.",
    teknologi: "Aplikasi web",
  },
  {
    judul: "Kinote",
    peran: "Anggota tim peneliti",
    deskripsi: "Riset aplikasi self-management untuk mahasiswa baru berbasis AI dan gamifikasi, dengan metode design thinking.",
    teknologi: "Riset dan desain aplikasi",
  },
];

export const KEAHLIAN = ["Cloud Computing", "Cybersecurity", "Next.js", "React", "TypeScript", "Tailwind CSS", "Public Speaking", "Digital Marketing", "Bahasa Inggris"];
