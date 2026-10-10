// Ruta PÚBLICA "/home": catálogo de autos. No requiere sesión.
import { useEffect, useState } from "react";
import { getErrorMessage } from "../lib/api";
import { getAutos } from "../services/autos";
import type { Auto } from "../types/auto";
import { AutoCard } from "../components/AutoCard";

export const Home = () => {
  const [autos, setAutos] = useState<Auto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // El callback de useEffect no puede ser async: se define una arrow async adentro y se la invoca.
  useEffect(() => {
    const loadAutos = async () => {
      try {
        setAutos(await getAutos());
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadAutos();
  }, []);

  if (loading) {
    return <p className="text-slate-500">Cargando autos...</p>;
  }

  if (error) {
    return <p className="text-red-600">No se pudieron cargar los autos: {error}</p>;
  }

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-slate-900">Catálogo</h2>
      {autos.length === 0 ? (
        <p className="text-slate-500">Todavía no hay autos cargados.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {autos.map((auto) => (
            <AutoCard key={auto._id} auto={auto} />
          ))}
        </div>
      )}
    </section>
  );
};
