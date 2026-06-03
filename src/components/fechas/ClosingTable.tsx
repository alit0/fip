import type { ClosingRow } from "@/mocks/types";

/** Closings/schedule table (regions or milestones) — light surface over the dark page.
 *  `labelHeader` is the first column heading (e.g. "Región" or "Etapa"). */
export default function ClosingTable({
  rows,
  labelHeader,
}: {
  rows: ClosingRow[];
  labelHeader: string;
}) {
  return (
    <div className="mx-auto max-w-5xl overflow-x-auto rounded-lg">
      <table className="w-full text-left text-sm">
        <thead className="bg-fip-purple-500 uppercase tracking-wide text-fip-white">
          <tr>
            <th className="px-4 py-3">{labelHeader}</th>
            <th className="px-4 py-3">Detalle</th>
            <th className="px-4 py-3 whitespace-nowrap">Cierre</th>
          </tr>
        </thead>
        <tbody className="text-fip-purple-900">
          {rows.map((row, i) => (
            <tr key={`${row.label}-${i}`} className={i % 2 ? "bg-fip-white/90" : "bg-fip-white"}>
              <td className="px-4 py-3 font-bold">{row.label}</td>
              <td className="px-4 py-3">{row.detail}</td>
              <td className="px-4 py-3 whitespace-nowrap font-bold text-fip-purple-500">
                {row.date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
