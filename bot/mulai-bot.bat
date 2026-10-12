@echo off
rem Menjalankan bot notifikasi K2 dari folder ini (dipakai Task Scheduler saat laptop menyala).
rem Catatan bot ditulis ke bot-log.txt di folder ini.
cd /d "%~dp0"
:ulang
node --env-file-if-exists=.env index.mjs >> bot-log.txt 2>&1
rem Kode 2 = sesi WhatsApp perlu scan QR ulang: berhenti, jalankan "npm start" manual untuk scan.
if %errorlevel%==2 goto selesai
rem Error lain: tunggu 30 detik lalu jalankan lagi.
timeout /t 30 /nobreak > nul
goto ulang
:selesai
echo Bot berhenti: perlu scan QR ulang. Buka folder bot lalu jalankan "npm start". >> bot-log.txt
