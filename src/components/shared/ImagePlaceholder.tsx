import { ImageIcon } from "lucide-react";

/**
 * Stand-in for a real image asset that does not exist yet (Phase 2 uses no real
 * media — the ./img screenshots are references, not assets). Renders a labelled box
 * so reviewers can see exactly where assets are pending.
 */
export default function ImagePlaceholder({
  label,
  className = "",
  rounded = "rounded-lg",
}: {
  label: string;
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`flex flex-col items-center justify-center gap-2 border border-dashed border-fip-white/30 bg-fip-white/5 p-4 text-center ${rounded} ${className}`}
    >
      <ImageIcon className="text-fip-white/40" size={28} strokeWidth={1.5} />
      <span className="text-[10px] uppercase tracking-widest text-fip-white/40">
        {label}
      </span>
    </div>
  );
}
