# Bot Notifikasi WhatsApp — Divisi K2

Bot ini mengirim laporan baru dari web K2 ke **satu grup WhatsApp kelas**:
pelanggaran, izin tidak masuk, izin sakit, petugas doa hari ini, tempat duduk diperbarui, dan ulang tahun hari ini.

Bot berjalan di **laptop** (Vercel tidak bisa menjalankan bot WhatsApp). Saat laptop mati, laporan tetap
tersimpan di antrian web dan dikirim begitu bot menyala lagi. Laporan yang menumpuk digabung jadi satu pesan rangkuman.
Template pesan, saklar per jenis laporan, dan status bot diatur di **Panel Admin → Notifikasi WA** (khusus Admin Website).

> Bot memakai [Baileys](https://github.com/WhiskeySockets/Baileys) (WhatsApp tidak resmi). Ada risiko nomor diblokir,
> jadi **pakai nomor cadangan**, bukan nomor utama.

## Persiapan sekali saja

1. **Nomor bot**: siapkan nomor WhatsApp cadangan, pakai normal beberapa hari (chat biasa), lalu masukkan ke grup kelas.
2. **Node.js**: pasang versi **LTS** dari <https://nodejs.org> (minimal versi 22). Cek di Command Prompt: `node -v`.
3. **Ambil folder bot**: unduh repo ini (tombol *Code → Download ZIP* di GitHub), ekstrak, lalu salin folder `bot`
   ke tempat tetap, misalnya `C:\k2-bot`.
4. Buka **Command Prompt** di folder itu (ketik `cmd` di address bar File Explorer), lalu jalankan:
   ```
   npm install
   ```
5. **File .env**: salin `contoh.env` menjadi `.env`, lalu isi `WEB_URL` dan `BOT_TOKEN` dari
   **Panel Admin → Notifikasi WA → Pemasangan** (tombol *Salin*).
6. **Sambungkan WhatsApp & cari grup**:
   ```
   npm run grup
   ```
   QR muncul di layar. Di HP nomor bot: **Setelan → Perangkat tertaut → Tautkan perangkat**, lalu scan.
   Setelah tersambung, daftar grup tampil. Salin baris `GROUP_ID=...` milik grup kelas ke file `.env`.
7. **Jalankan bot**:
   ```
   npm start
   ```
   Di Panel Admin → Notifikasi WA, klik **Kirim pesan uji**. Dalam ±30 detik pesan uji masuk ke grup
   dan status bot berubah jadi **Aktif**.

Sesi login disimpan di folder `sesi-wa` (di laptop, bukan di internet), jadi tidak perlu scan QR lagi saat bot
dijalankan ulang. **Jangan bagikan folder `sesi-wa` dan file `.env`.** Pindah laptop = salin folder `bot` beserta
`sesi-wa` dan `.env`-nya.

## Supaya bot jalan sendiri saat laptop menyala

**Task Scheduler** (bot berjalan tanpa jendela):

1. Buka *Task Scheduler* → **Create Task…**
2. Tab *General*: nama `Bot K2`, pilih **Run whether user is logged on or not**.
3. Tab *Triggers* → *New…* → **At log on** (user kamu).
4. Tab *Actions* → *New…* → *Start a program*:
   - Program: `C:\k2-bot\mulai-bot.bat`
   - Start in: `C:\k2-bot`
5. Tab *Conditions*: hilangkan centang **Start the task only if the computer is on AC power**.
6. Tab *Settings*: centang **If the task fails, restart every 1 minute**. Simpan (masukkan password Windows).

Cara lebih sederhana: tekan `Win + R`, ketik `shell:startup`, lalu buat shortcut ke `mulai-bot.bat` di folder itu
(jendela hitam akan terbuka setiap login; boleh di-minimize, jangan ditutup).

Catatan bot tersimpan di `bot-log.txt`.

**Pengaturan daya** (Settings → System → Power): saat dicolok, *Sleep* = **Never**; dan di
*Control Panel → Power Options → Choose what closing the lid does* = **Do nothing**.

## Kalau ada masalah

| Gejala | Solusi |
| --- | --- |
| `bot-log.txt` berisi "perlu scan QR ulang" / "dikeluarkan dari WhatsApp" | Buka Command Prompt di folder bot, jalankan `npm start`, scan QR lagi. |
| "BOT_TOKEN ditolak web" | Kunci sudah dibuat ulang di Panel Admin. Salin `.env` yang baru. |
| Status bot "Tidak aktif" padahal laptop menyala | Cek `bot-log.txt`, atau jalankan `npm start` manual untuk melihat pesannya. |
| Laporan Google Form tidak masuk antrian | Pastikan kode Apps Script di Panel Admin sudah dipasang dan `pasangPemicu` sudah dijalankan. |
| Ingin mencoba tanpa WhatsApp | `npm run uji` — pesan hanya ditampilkan di layar (antrian tetap dikosongkan). |

## Tips supaya nomor tidak diblokir

- Jangan memakai nomor baru yang langsung dipakai bot; pakai normal dulu beberapa hari.
- Bot sudah memberi jeda 4–7 detik antar-pesan dan menggabungkan laporan yang menumpuk.
- Jangan menjalankan bot di dua laptop sekaligus.
- Jangan menambahkan nomor bot ke banyak grup lain.
