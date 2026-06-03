import type { DiscountRow } from "@/mocks/types";

/** Discounts table — light surface over the dark page, matching the live site. */
export default function DiscountTable({ rows }: { rows: DiscountRow[] }) {
  return (
    <div className="mx-auto max-w-4xl overflow-x-auto rounded-lg">
      <table className="w-full text-left text-sm">
        <thead className="bg-fip-purple-500 uppercase tracking-wide text-fip-white">
          <tr>
            <th className="px-4 py-3">Descuento</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Condición</th>
            <th className="px-4 py-3">Vigencia</th>
          </tr>
        </thead>
        <tbody className="text-fip-purple-900">
          {rows.map((row, i) => (
            <tr key={`${row.descuento}-${i}`} className={i % 2 ? "bg-fip-white/90" : "bg-fip-white"}>
              <td className="px-4 py-4 font-title text-2xl font-black">{row.descuento}</td>
              <td className="px-4 py-4 font-bold">{row.tipo}</td>
              <td className="px-4 py-4">{row.condicion}</td>
              <td className="px-4 py-4 whitespace-nowrap">{row.vigencia}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
