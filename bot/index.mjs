// Bot notifikasi WhatsApp Divisi K2 (dijalankan di laptop, bukan di Vercel).
// Cara kerja: tiap beberapa detik bot bertanya ke web K2 "ada pesan baru?" (/api/notify/pull).
// Pesan sudah dirakit oleh web; bot cukup mengirimnya ke grup lalu konfirmasi (/api/notify/ack).
// Saat laptop mati, pesan menunggu di antrian web dan dikirim begitu bot menyala lagi.
//
//   npm start      jalankan bot
//   npm run grup   tampilkan daftar grup + GROUP_ID-nya
//   npm run uji    tanpa WhatsApp: pesan hanya ditampilkan di layar (untuk mencoba sambungan ke web)
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import makeWASocket, { Browsers, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } from "baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";

const MODE = process.argv[2] ?? "jalan"; // jalan | grup | uji
const WEB_URL = (process.env.WEB_URL ?? "").replace(/\/+$/, "");
const BOT_TOKEN = process.env.BOT_TOKEN ?? "";
const GROUP_ID = (process.env.GROUP_ID ?? "").trim();
const SESI = fileURLToPath(new URL("./sesi-wa", import.meta.url)); // sesi login WhatsApp (jangan dibagikan)
const JEDA_PESAN = [4000, 7000]; // jeda acak antar-pesan (ms) supaya tidak terlihat seperti spam
const EXIT_PERLU_QR = 2; // mulai-bot.bat berhenti mengulang kalau perlu scan QR manual

const log = (...a) => console.log(`[${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}]`, ...a);
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

function wajib(ok, pesan) {
  if (ok) return;
  console.error(`\n✖ ${pesan}\n  Lihat bot/README.md bagian "Pemasangan".\n`);
  process.exit(1);
}

if (MODE !== "grup") {
  wajib(/^https?:\/\//.test(WEB_URL), "WEB_URL belum diisi di file .env");
  wajib(BOT_TOKEN.length > 10, "BOT_TOKEN belum diisi di file .env (salin dari Panel Admin → Notifikasi WA)");
}
if (MODE === "jalan") wajib(/@g\.us$/.test(GROUP_ID), 'GROUP_ID belum diisi di file .env. Jalankan "npm run grup" dulu untuk melihatnya.');

/* ------------------------------------------------------------ WhatsApp */

let sock = null;
let siap = false;

async function sambung() {
  const { state, saveCreds } = await useMultiFileAuthState(SESI);
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: undefined }));
  sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    browser: Browsers.windows("Chrome"),
    markOnlineOnConnect: false, // jangan membuat nomor bot terlihat "online" terus
    syncFullHistory: false,
  });
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      log("Scan QR ini dengan WhatsApp nomor bot: Setelan → Perangkat tertaut → Tautkan perangkat.");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "open") {
      siap = true;
      log("✔ Tersambung ke WhatsApp.");
      if (MODE === "grup") await tampilkanGrup();
    }
    if (connection === "close") {
      siap = false;
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        log("✖ Perangkat ini dikeluarkan dari WhatsApp. Sesi dihapus. Jalankan \"npm start\" lalu scan QR lagi.");
        rmSync(SESI, { recursive: true, force: true });
        process.exit(EXIT_PERLU_QR);
      }
      const ulang = code === DisconnectReason.restartRequired ? 500 : 5000;
      log(`Koneksi WhatsApp terputus (kode ${code ?? "?"}), menyambung ulang...`);
      setTimeout(() => sambung().catch((e) => log("Gagal menyambung:", e.message)), ulang);
    }
  });
}

async function tampilkanGrup() {
  const grup = Object.values(await sock.groupFetchAllParticipating());
  console.log(`\nGrup yang diikuti nomor ini (${grup.length}):\n`);
  for (const g of grup.sort((a, b) => a.subject.localeCompare(b.subject))) console.log(`  ${g.subject}\n    GROUP_ID=${g.id}\n`);
  console.log("Salin baris GROUP_ID grup kelas ke file .env, lalu jalankan \"npm start\".\n");
  process.exit(0);
}

/* ------------------------------------------------------------ Antrian web */

let jeda = 30; // detik; diatur dari Panel Admin (dikirim web bersama pesan)
const headers = { Authorization: `Bearer ${BOT_TOKEN}`, "Content-Type": "application/json" };

async function kirim(text) {
  if (MODE === "uji") return console.log(`\n────── [uji] pesan ke grup ──────\n${text}\n─────────────────────────────────\n`);
  await sock.sendMessage(GROUP_ID, { text });
}

async function putaran() {
  if (MODE === "jalan" && !siap) return setTimeout(putaran, 5000); // tunggu WhatsApp tersambung dulu
  let tunggu = jeda * 1000;
  try {
    const r = await fetch(`${WEB_URL}/api/notify/pull`, { headers });
    if (r.status === 401) log("✖ BOT_TOKEN ditolak web. Salin ulang dari Panel Admin → Notifikasi WA.");
    else if (!r.ok) log(`Web menjawab ${r.status}, dicoba lagi nanti.`);
    else {
      const { messages = [], interval } = await r.json();
      if (interval) jeda = interval;
      for (const m of messages) {
        if (MODE === "jalan" && !siap) break; // koneksi putus di tengah jalan: sisanya dikirim nanti
        await kirim(m.text);
        log(`Terkirim: ${m.type} (${m.ids.length} laporan)`);
        const a = await fetch(`${WEB_URL}/api/notify/ack`, { method: "POST", headers, body: JSON.stringify({ ids: m.ids, type: m.type, text: m.text }) });
        if (!a.ok) log(`Konfirmasi ke web gagal (${a.status}); pesan ini mungkin terkirim dua kali.`);
        await tidur(JEDA_PESAN[0] + Math.random() * (JEDA_PESAN[1] - JEDA_PESAN[0]));
      }
    }
  } catch (e) {
    log("Gagal mengirim / mengecek antrian:", e.message);
    tunggu = Math.max(tunggu, 60_000); // misal internet putus: jangan terlalu sering mencoba
  }
  setTimeout(putaran, tunggu);
}

/* ------------------------------------------------------------ Mulai */

log(`Bot notifikasi K2 mulai (mode: ${MODE}).`);
if (MODE !== "uji") await sambung();
if (MODE !== "grup") putaran();
