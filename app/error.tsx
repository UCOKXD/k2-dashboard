"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-xl bg-red-50 p-6">
      <p className="font-semibold text-red-700">Data belum bisa dimuat.</p>
      <p className="mt-1 text-sm">
        Cek SHEET_ID, GOOGLE_API_KEY, nama tab, dan pastikan sheet dibagikan sebagai &quot;Anyone with the link: Viewer&quot;.
      </p>
      <button onClick={reset} className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm text-white">
        Coba lagi
      </button>
    </div>
  );
}
