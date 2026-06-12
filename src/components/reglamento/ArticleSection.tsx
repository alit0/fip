import type { RegulationArticle, ScoreRow } from "@/mocks/types";
import ScoreTable from "@/components/shared/ScoreTable";

/** A single regulation article: blue header bar (letter + theme) and body. */
export default function ArticleSection({
  article,
  scoreTable,
}: {
  article: RegulationArticle;
  scoreTable: ScoreRow[];
}) {
  return (
    <article id={`reg-${article.letter}`} className="scroll-mt-28">
      <header className="flex items-center gap-3 rounded-md bg-fip-blue px-4 py-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-fip-white/15 font-title text-lg font-black">
          {article.letter}
        </span>
        <h2 className="font-title text-base font-bold uppercase tracking-wide">
          {article.theme}
        </h2>
      </header>

      <div className="px-1 py-5 text-fip-white/85">
        {article.body ? (
          <p className="whitespace-pre-line">{article.body}</p>
        ) : (
          <p className="text-sm italic text-fip-white/40">Contenido legal en preparación.</p>
        )}
        {article.showScoreTable && <ScoreTable rows={scoreTable} />}
      </div>
    </article>
  );
}
