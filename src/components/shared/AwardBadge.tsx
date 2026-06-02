import { Trophy, Gem, Award } from "lucide-react";
import type { AwardIcon } from "@/mocks/types";

/**
 * Award-level icon for a category (oro / cristal / platino).
 * TODO: replace lucide stand-ins with the real PNG assets
 * (oro-button.png, cristal-nuevo.png, platino.png).
 */
const MAP: Record<AwardIcon, { Icon: typeof Trophy; className: string; label: string }> = {
  oro: { Icon: Trophy, className: "text-fip-gold", label: "Oro" },
  cristal: { Icon: Gem, className: "text-cyan-200", label: "Cristal" },
  platino: { Icon: Award, className: "text-slate-200", label: "Platino" },
};

export default function AwardBadge({
  award,
  size = 28,
}: {
  award: AwardIcon;
  size?: number;
}) {
  const { Icon, className, label } = MAP[award];
  return (
    <span title={`Premio ${label}`} aria-label={`Premio ${label}`}>
      <Icon size={size} strokeWidth={1.75} className={className} />
    </span>
  );
}
