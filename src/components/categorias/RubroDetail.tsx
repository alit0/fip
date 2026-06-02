import type { Category, Rubro } from "@/mocks/types";
import CategoryItem from "./CategoryItem";

/** A rubro section: blue header (number + name + code) and its categories. */
export default function RubroDetail({
  rubro,
  categories,
  pendingRange,
}: {
  rubro: Rubro;
  categories: Category[];
  pendingRange?: string;
}) {
  return (
    <section id={`rubro-${rubro.number}`} className="scroll-mt-28">
      <header className="flex items-center gap-3 rounded-md bg-fip-blue px-4 py-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-fip-white/15 font-title text-lg font-black">
          {rubro.number}
        </span>
        <h2 className="font-title text-base font-bold uppercase tracking-wide">
          {rubro.name} <span className="text-fip-white/60">({rubro.code})</span>
        </h2>
      </header>

      {categories.length > 0 ? (
        <ul className="mt-2">
          {categories.map((category) => (
            <CategoryItem key={category.code} category={category} />
          ))}
        </ul>
      ) : (
        <p className="px-1 py-5 text-sm italic text-fip-white/40">
          TODO: categorías de este rubro{pendingRange ? ` (${pendingRange})` : ""} — títulos y
          descripciones pendientes de transcripción desde categorias.pdf.
        </p>
      )}
    </section>
  );
}
