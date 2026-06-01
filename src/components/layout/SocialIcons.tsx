import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/navigation";

const ICONS: Record<string, LucideIcon> = {
  Instagram,
  Facebook,
  X: Twitter,
  LinkedIn: Linkedin,
  YouTube: Youtube,
  WhatsApp: MessageCircle,
};

export default function SocialIcons({ className }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-3 ${className ?? ""}`}>
      {SOCIAL_LINKS.map(({ name, href }) => {
        const Icon = ICONS[name] ?? MessageCircle;
        return (
          <li key={name}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              className="text-fip-white/80 transition-colors hover:text-fip-gold"
            >
              <Icon size={18} strokeWidth={1.75} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
