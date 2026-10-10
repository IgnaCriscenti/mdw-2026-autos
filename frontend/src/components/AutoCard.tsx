// Presentacional: recibe un auto por props, no sabe nada de axios ni de estado.
// Toda la card es un <Link>: click en cualquier parte navega al detalle (/autos/:id).
import { Link } from "react-router";
import { formatKm, formatPrice } from "../lib/format";
import type { Auto } from "../types/auto";

interface AutoCardProps {
  auto: Auto;
}

export const AutoCard = ({ auto }: AutoCardProps) => {
  return (
    <Link
      to={`/autos/${auto._id}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
    >
      <article>
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700 capitalize">
            {auto.combustible}
          </span>
          <span className={`text-xs ${auto.disponible ? "text-green-600" : "text-slate-400"}`}>
            {auto.disponible ? "Disponible" : "Vendido"}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">
          {auto.marca} {auto.modelo}
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          {auto.anio} · {formatKm(auto.kilometraje)}
        </p>
        <p className="mt-3 text-lg font-semibold text-slate-900">{formatPrice(auto.precio)}</p>
        <p className="mt-1 text-xs text-slate-400">Ver detalle →</p>
      </article>
    </Link>
  );
};
