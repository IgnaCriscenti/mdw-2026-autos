// Ruta PÚBLICA "/autos/:id". El id sale de la URL con useParams.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getErrorMessage } from "../lib/api";
import { formatKm, formatPrice } from "../lib/format";
import { getAutoById } from "../services/autos";
import type { Auto } from "../types/auto";

export const AutoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [auto, setAuto] = useState<Auto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadAuto = async () => {
      setLoading(true);
      setError(null);
      try {
        setAuto(await getAutoById(id));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadAuto();
  }, [id]);

  if (loading) {
    return <p className="text-slate-500">Cargando auto...</p>;
  }

  if (error || !auto) {
    return (
      <section>
        <p className="text-red-600">No se pudo cargar el auto: {error}</p>
        <Link to="/home" className="mt-2 inline-block text-slate-600 underline">
          Volver al catálogo
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <Link to="/home" className="text-sm text-slate-500 underline">
        Volver al catálogo
      </Link>
      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
        {auto.marca} {auto.modelo}
      </h2>
      <p className="text-2xl font-semibold text-brand-700">{formatPrice(auto.precio)}</p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <dt className="text-slate-500">Año</dt>
        <dd className="text-slate-900">{auto.anio}</dd>
        <dt className="text-slate-500">Kilometraje</dt>
        <dd className="text-slate-900">{formatKm(auto.kilometraje)}</dd>
        <dt className="text-slate-500">Combustible</dt>
        <dd className="text-slate-900 capitalize">{auto.combustible}</dd>
        <dt className="text-slate-500">Patente</dt>
        <dd className="font-mono text-slate-900">{auto.patente}</dd>
        <dt className="text-slate-500">Estado</dt>
        <dd className={auto.disponible ? "text-green-600" : "text-slate-400"}>
          {auto.disponible ? "Disponible" : "Vendido"}
        </dd>
      </dl>
    </section>
  );
};
