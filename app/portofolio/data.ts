// Isi halaman portofolio (link di bio Instagram). Ubah teks di sini saja, tampilannya ada di page.tsx.
// Tautan yang dikosongkan ("") otomatis tidak ditampilkan.

export const PROFIL = {
  nama: "Francis Demetrio Villanova",
  panggilan: "Ancis",
  peran: "Mahasiswa BINUS University",
  bio: "Suka membangun aplikasi web yang benar-benar dipakai orang, dari dashboard kelas sampai platform belajar. Sekarang juga ikut riset pengembangan aplikasi untuk mahasiswa baru.",
  absenFoto: 18, // nomor absen di web K2; fotonya diambil dari foto akun
};

// Isi username/alamat untuk menampilkan tombolnya. Contoh: instagram: "usernamekamu"
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

export const KEAHLIAN = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Desain antarmuka", "Riset dan penulisan jurnal"];
