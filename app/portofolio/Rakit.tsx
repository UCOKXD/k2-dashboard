// Teks yang hurufnya berserakan lalu merakit diri saat bagiannya masuk layar (dan berserakan lagi saat keluar).
// Posisi acak dihitung di server dari urutan huruf, jadi sama setiap kali dan tidak butuh JS untuk menghitung.
// Gerak dijalankan Gerak.tsx (atribut data-masuk) dan portofolio.css.

function acak(i: number, garam: number) {
  const x = Math.sin(i * 12.9898 + garam * 78.233) * 43758.5453;
  return x - Math.floor(x); // 0..1
}

type Props = {
  baris: string[]; // tiap item = satu baris
  indent?: string[]; // kelas Tailwind indentasi per baris, mis. ["", "pl-[1.2em]"]
  className?: string;
  as?: "h1" | "h2" | "p" | "span";
  garam?: number;
  hiasan?: boolean; // true = hanya hiasan (teksnya sudah dibacakan elemen lain), disembunyikan dari pembaca layar
};

export default function Rakit({ baris, indent = [], className = "", as: Tag = "h2", garam = 1, hiasan = false }: Props) {
  let n = 0;
  return (
    <Tag data-rakit aria-hidden={hiasan || undefined} className={`pf-rakit ${className}`}>
      {!hiasan && <span className="sr-only">{baris.join(" ")}</span>}
      <span aria-hidden="true">
        {baris.map((b, bi) => (
          <span key={bi} className={`block whitespace-pre ${indent[bi] ?? ""}`}>
            {[...b].map((h, hi) => {
              const i = n++;
              if (h === " ") return <span key={hi}> </span>;
              const style = {
                "--tx": `${(acak(i, garam) - 0.5) * 1.4}em`,
                "--ty": `${(acak(i, garam + 1) - 0.5) * 1.1}em`,
                "--rot": `${(acak(i, garam + 2) - 0.5) * 70}deg`,
                "--d": `${Math.round(acak(i, garam + 3) * 380)}ms`,
              } as React.CSSProperties;
              return (
                <span key={hi} className="pf-huruf" style={style}>
                  {h}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    </Tag>
  );
}
