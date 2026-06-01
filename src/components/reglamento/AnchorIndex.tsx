import type { RegulationArticle } from "@/mocks/types";

/** Top index of A–R anchors (blue letter badges) that jump to each article. */
export default function AnchorIndex({
  articles,
}: {
  articles: RegulationArticle[];
}) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <li key={article.letter}>
          <a
            href={`#reg-${article.letter}`}
            className="flex items-center gap-3 rounded-md bg-fip-white/5 px-3 py-2 transition hover:bg-fip-white/10"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-fip-blue text-sm font-bold text-fip-white">
              {article.letter}
            </span>
            <span className="text-sm text-fip-white/80">{article.theme}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
