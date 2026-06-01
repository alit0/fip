import type { ScoreRow } from "@/mocks/types";

/** Recurring FIP score table (Gran Prix 12 · Oro 10 · Plata 6 · Bronce 4 · Finalista 1). */
export default function ScoreTable({ rows }: { rows: ScoreRow[] }) {
  return (
    <table className="my-4 w-full max-w-sm overflow-hidden rounded-md text-sm">
      <thead>
        <tr className="bg-fip-purple-500 text-left uppercase tracking-wide">
          <th className="px-4 py-2 font-bold">Premio</th>
          <th className="px-4 py-2 font-bold">Puntaje</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={row.award}
            className={i % 2 === 0 ? "bg-fip-white/5" : "bg-fip-white/10"}
          >
            <td className="px-4 py-2">{row.award}</td>
            <td className="px-4 py-2 font-bold text-fip-gold">{row.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
