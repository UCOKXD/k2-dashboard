// Format jam 24 jam ala Indonesia (00.00–23.59). Data tetap disimpan "HH:MM"; tampilan memakai titik.
export const jam = (hhmm: string) => (hhmm ? hhmm.replace(":", ".") : "");

// Opsi tanggal/jam untuk toLocaleString: selalu 24 jam, zona Jakarta.
export const JKT_24 = { timeZone: "Asia/Jakarta", hourCycle: "h23" } as const;
