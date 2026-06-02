import type { Rubro } from "@/mocks/types";

/** Card in the top index grid; jumps to the rubro detail anchor (#rubro-N). */
export default function RubroCard({ rubro }: { rubro: Rubro }) {
  return (
    <a
      href={`#rubro-${rubro.number}`}
      className="flex items-center gap-3 rounded-md bg-fip-gold px-4 py-3 font-body text-sm font-bold text-fip-purple-900 transition hover:brightness-110"
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-fip-purple-900 text-xs text-fip-gold">
        {rubro.number}
      </span>
      <span className="leading-tight">{rubro.name}</span>
    </a>
  );
}
