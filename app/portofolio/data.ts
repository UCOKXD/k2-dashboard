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
// Instagram dan TikTok tampil sebagai ikon di sisi kiri poster; yang lain di baris atas.
export const KONTAK = {
  instagram: "",
  tiktok: "",
  linkedin: "",
  github: "UCOKXD",
  email: "",
};

// Logo ada di public/portofolio/logo/<file>.webp (latar sudah dibuang, maks 160 px).
export type Logo = { nama: string; file: string; w: number; h: number };

// Beasiswa: lencana kecil di bawah kutipan.
export const BEASISWA: Logo = { nama: "BCA", file: "bca", w: 160, h: 53 };

// Chip alat yang mengambang di sekitar foto (seperti contoh "Photoshop", "Figma").
// `teks` hanya untuk logo berbentuk ikon; logo yang sudah berisi tulisan tampil tanpa teks tambahan.
// `posisi` = kelas Tailwind letak chip (HP lalu md:), `r` = kemiringan.
export const LOGO_MENGAMBANG: (Logo & { teks?: string; posisi: string; r: number; hp: boolean })[] = [
  { nama: "Claude", file: "claude", w: 160, h: 35, posisi: "left-3 top-[455px] md:left-[24%] md:top-[54%]", r: -6, hp: true },
  { nama: "Figma", file: "figma", w: 160, h: 160, teks: "Figma", posisi: "right-3 top-[395px] md:left-auto md:right-[20%] md:top-[46%]", r: 5, hp: true },
  { nama: "Google Cloud", file: "google-cloud", w: 160, h: 76, posisi: "md:right-[16%] md:top-[60%]", r: -4, hp: false },
  { nama: "AWS", file: "aws", w: 160, h: 96, posisi: "md:left-[30%] md:top-[70%]", r: 4, hp: false },
];

// Logo bahasa & alat yang "meledak" keluar dari belakang foto saat halaman di-scroll turun.
// x, y = jarak tujuan dari tengah foto di layar lebar (px), di belakang foto.
// xh, yh = untuk HP: di tepi kiri/kanan dan di depan foto, karena di HP foto hampir selebar layar.
export const LOGO_LEDAKAN: (Logo & { x: number; y: number; xh: number; yh: number; r: number })[] = [
  { nama: "PHP", file: "php", w: 160, h: 84, x: -170, y: -266, xh: -161, yh: -30, r: -10 },
  { nama: "C++", file: "cpp", w: 143, h: 160, x: 180, y: -276, xh: 161, yh: -150, r: 8 },
  { nama: "Python", file: "python", w: 160, h: 160, x: 340, y: -116, xh: 161, yh: -60, r: 12 },
  { nama: "HTML5", file: "html5", w: 114, h: 160, x: -340, y: -76, xh: -161, yh: 50, r: -8 },
  { nama: "Docker", file: "docker", w: 160, h: 137, x: 450, y: -56, xh: 161, yh: 150, r: 6 },
  { nama: "Node.js", file: "nodejs", w: 160, h: 98, x: -235, y: 250, xh: -161, yh: 190, r: -5 },
  { nama: "MySQL", file: "mysql", w: 160, h: 96, x: 230, y: 274, xh: 95, yh: 210, r: 7 },
  { nama: "Linux", file: "linux", w: 133, h: 160, x: 510, y: 54, xh: -95, yh: -170, r: -12 },
];

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

export const KEAHLIAN = [
  "Cloud Computing",
  "Cybersecurity",
  "AWS",
  "Google Cloud",
  "Docker",
  "Linux",
  "PHP",
  "C++",
  "Python",
  "Node.js",
  "MySQL",
  "HTML",
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Figma",
  "Public Speaking",
  "Digital Marketing",
  "Bahasa Inggris",
];
