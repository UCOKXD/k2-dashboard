# DESIGN.md · Web K2 ABSORBING PPTI 28

Arah desain web Divisi K2. Dibaca sebelum mengubah tampilan apa pun; aturan antislop dipakai sebagai filter di atasnya.
Disusun dari konsultasi design council (Ive, Rams, Hadid, Ingels, Norman) dan disetujui pemilik (Francis) pada 2 November 2026.

## Design Read

Pusat informasi kelas untuk 34 mahasiswa ABSORBING PPTI 28 yang kebanyakan membukanya di HP di sela kuliah.
Bahasa visual: **papan kelas berjaket varsity**, buku tahunan dan papan pengumuman kelas dengan maskot axolotl berjaket "28".

**Dial: ENERGY 2 / RHYTHM 2 / MOTION 2**

- ENERGY 2: ramah dan hangat, tidak ramai. Satu momen besar per halaman, sisanya tenang.
- RHYTHM 2: komposisi bagian bervariasi sesuai isinya (panggung kartu, daftar, angka, linimasa), bukan satu template berulang.
- MOTION 2: transisi dan reveal saat dibutuhkan. Gerak hias yang berjalan terus wajib bisa dijeda (tombol "Jeda animasi").

## Identitas

- **Motif identitas:** maskot axolotl K2 (stiker). Satu-satunya motif yang diulang. Paling banyak satu stiker per layar, dan diletakkan di momen yang bermakna: data kosong, berhasil, error, sapaan.
- **Momen besar:** sampul foto kelas di Beranda dan panel jam di Waktu. Halaman lain memakai kepala tenang di atas kertas.

## Warna (R-29: 3 inti + 1 aksen)

| Peran | Terang | Gelap | Alasan |
|---|---|---|---|
| Kertas (latar) | `--paper #f4f7fb` | `#07142a` | Papan pengumuman; netral supaya konten yang bicara |
| Navy jaket (teks, bingkai) | `--ink #0b1e3d` | `#eaf0f8` | Warna jaket varsity ABSORBING |
| Biru laut (tombol, tautan) | `--accent #1f7dba` / `--accent-ink #165f93` | `#5cb8ee` / `#84ccf4` | Habitat axolotl; satu warna aksi supaya mudah dikenali |
| Pink axolotl (aksen tunggal) | `#b4577a` (teks), `#f8c3cf` (hias) | `#f9a8d4` | Hanya momen gembira: maskot, ulang tahun, easter egg |

Warna status (bukan palet inti, hanya bila menandai status nyata): `--ok`, `--warn`, `--bad` beserta `-soft`.
Teks kecil pakai `--accent-ink`, bukan `--accent` (kontras `--accent` di putih 4,47:1, kurang dari 4,5:1).
Semua pasangan teks diuji dengan `contrast-check.py` antislop; minimal 4,5:1 untuk teks biasa.

## Tipografi (tiga tingkat)

- **Judul:** Bricolage Grotesque. Alasan: bentuknya bulat dan ramah seperti huruf varsity.
- **Isi:** Plus Jakarta Sans. Alasan: dibuat desainer Indonesia, jelas di layar kecil.
- **Angka:** JetBrains Mono, hanya untuk jam, tanggal, NIM, nomor absen (angka rata lebar). Tidak dipakai untuk label.
- Label bagian ditulis kalimat biasa, tidak huruf kapital berjarak lebar.

## Bentuk (R-11)

- Kartu: sudut 14–16 px (`--r-lg`), seperti emblem jaket.
- Tombol dan isian: sudut 10 px (`--r-md`).
- Bentuk pil hanya untuk chip status dan Dynamic Island.

## Kedalaman (R-10, R-12, R-13)

- Kartu biasa: garis tipis `--line`, tanpa bayangan besar.
- Bayangan hanya untuk benda yang mengambang di atas halaman: Dynamic Island, dialog, kartu kenalan aktif.
- Efek kaca (blur) hanya di Dynamic Island.
- Gradasi hanya di sampul foto (supaya teks di atas foto terbaca). Glow hanya di easter egg developer.

## Gerak

- Reveal saat scroll untuk kartu pengurus; pergantian kartu kenalan 4 detik dengan tombol jeda; sampul foto berganti dengan tombol jeda.
- Animasi hias terus-menerus (axolotl berenang, gelembung, konfeti, stiker terbang) bisa dijeda lewat tombol "Jeda animasi" dan berhenti bila perangkat meminta gerak dikurangi.
- Tidak ada denyut tanpa henti pada titik atau ikon.

## Interaksi (R-03, R-32, R-39)

- Semua kontrol minimal 44 × 44 px di layar sentuh, kursor tangan, cincin fokus biru 2 px.
- Aksi memakai `<button>`, navigasi memakai `<a href>`.
- Setiap halaman satu `h1`.

## Suara (copy)

- Bahasa Indonesia santai khas kelas: "Yuk Kenalan!!", "Say HI to ABSORBERS!!", "Halo, ABSORBERS!".
- Tanpa tanda pisah panjang, tanpa emoji di antarmuka, tanpa kata kapital untuk penekanan.
- Tombol menyebut tindakannya: "Lihat jadwal", "Hubungi K2", "Lihat profil Ancis".

## Pengecualian yang disetujui pemilik

- Nama "Hall of Shame" dan tanda seru ganda di sapaan dipertahankan sebagai suara kelas.
- Judul berkilau dan aura biru di profil developer adalah easter egg yang disengaja (glow dan gradasi hanya di sana).
- Pesan WhatsApp grup (bukan antarmuka web) boleh memakai emoji.

## Halaman portofolio (`/portofolio`, arah sendiri)

Halaman link bio Instagram milik Francis, bukan bagian papan kelas. Tampil tanpa header dan menu dashboard.
Disusun dengan design council pada 5 November 2026; masih draf sampai disetujui pemilik.

- **Design Read:** poster "loud engineering". Satu momen besar (nama raksasa di belakang foto potong), sisanya tenang di atas kertas.
- **Warna:** tetap token K2. Nama raksasa biru laut, kartu terminal dan kartu proyek navy jaket di kedua tema, pink hanya chip "Sedang dikelola" dan prompt terminal.
- **Pengecualian dari aturan kelas, dengan alasan:**
  - JetBrains Mono dipakai di kartu terminal karena isinya memang meniru baris perintah, bukan label hias.
  - Kisi kertas milimeter di latar poster: bahan "kertas gambar teknik", dibuat dari garis `--line`, bukan gradasi warna.
  - Arsiran pada angka 28: konvensi gambar teknik, menggantikan angka bergaris di referensi.
  - Masker pudar di bawah foto potong (hanya di HP) supaya foto menyatu dengan kertas.
- **Logo:** chip alat mengambang (Claude, Figma, Google Cloud, AWS), lencana "Penerima beasiswa BCA", ikon Instagram dan TikTok di sisi kiri. Logo berlatar putih di kedua tema supaya logo bertulisan gelap tetap terbaca.
- **Gerak:** chip mengambang pelan (bisa dijeda lewat tombol "Jeda animasi"); saat halaman di-scroll turun, logo bahasa dan alat meledak keluar dari belakang foto lalu kembali saat ke atas; semua elemen bereaksi saat disorot. Semua gerak berhenti bila perangkat meminta gerak dikurangi. Logo ledakan baru dimuat saat browser senggang supaya muat awal tetap ringan.
