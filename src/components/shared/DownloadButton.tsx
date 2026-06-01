import { Download } from "lucide-react";

/** Download link for PDF/PPTX/DOCX assets, with optional language badge (ES/PT). */
export default function DownloadButton({
  label,
  href,
  lang,
}: {
  label: string;
  href: string;
  lang?: "ES" | "PT";
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-full bg-fip-gold px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-fip-purple-900 transition hover:brightness-110"
    >
      <Download size={16} strokeWidth={2} />
      {label}
      {lang && (
        <span className="rounded bg-fip-purple-900/15 px-1.5 py-0.5 text-[10px]">
          {lang}
        </span>
      )}
    </a>
  );
}
