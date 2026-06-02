import type { Category } from "@/mocks/types";
import AwardBadge from "@/components/shared/AwardBadge";

export default function CategoryItem({ category }: { category: Category }) {
  return (
    <li className="flex gap-4 border-b border-white/5 py-4">
      <div className="shrink-0 pt-1">
        <AwardBadge award={category.award} />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-body text-sm font-bold text-fip-white/60">
            {category.code}
          </span>
          <h3 className="font-title text-sm font-bold uppercase tracking-wide text-fip-gold">
            {category.title ?? "TODO: título"}
          </h3>
          {category.isSpecial && (
            <span className="rounded-full bg-fip-purple-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
              Especial{category.specialType ? ` · ${category.specialType}` : ""}
            </span>
          )}
          {category.isNew && (
            <span className="rounded-full bg-fip-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-fip-purple-900">
              Nueva
            </span>
          )}
        </div>
        {category.description && (
          <p className="mt-1 text-sm text-fip-white/70">{category.description}</p>
        )}
      </div>
    </li>
  );
}
