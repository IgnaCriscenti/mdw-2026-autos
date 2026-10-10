// Ruta PROTEGIDA POR ROL "/admin": sólo ADMIN. Gestiona el catálogo.
// Aunque alguien saltee el guard del front, el backend rechaza estas acciones con 401/403.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getErrorMessage } from "../lib/api";
import { formatPrice } from "../lib/format";
import { deleteAuto, getAutos, updateAuto } from "../services/autos";
import type { Auto } from "../types/auto";

export const Admin = () => {
  const [autos, setAutos] = useState<Auto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  const handleToggle = async (auto: Auto) => {
    setBusyId(auto._id);
    setError(null);
    try {
      const updated = await updateAuto(auto._id, { disponible: !auto.disponible });
      setAutos((current) => current.map((a) => (a._id === updated._id ? updated : a)));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (auto: Auto) => {
    if (!window.confirm(`¿Eliminar ${auto.marca} ${auto.modelo} (${auto.patente})?`)) return;
    setBusyId(auto._id);
    setError(null);
    try {
      await deleteAuto(auto._id);
      setAutos((current) => current.filter((a) => a._id !== auto._id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Panel de administración</h2>
          <p className="text-sm text-slate-500">Sólo visible para usuarios con rol ADMIN.</p>
        </div>
        <Link
          to="/admin/autos/nuevo"
          className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          + Nuevo auto
        </Link>
      </div>

      {error && (
        <p role="alert" className="mb-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500">Cargando autos...</p>
      ) : autos.length === 0 ? (
        <p className="text-slate-500">No hay autos cargados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2 pr-3 font-medium">Auto</th>
                <th className="py-2 pr-3 font-medium">Patente</th>
                <th className="py-2 pr-3 font-medium">Precio</th>
                <th className="py-2 pr-3 font-medium">Estado</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {autos.map((auto) => (
                <tr key={auto._id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 pr-3 text-slate-900">
                    {auto.marca} {auto.modelo} <span className="text-slate-400">({auto.anio})</span>
                  </td>
                  <td className="py-2 pr-3 font-mono">{auto.patente}</td>
                  <td className="py-2 pr-3">{formatPrice(auto.precio)}</td>
                  <td className="py-2 pr-3">
                    <button
                      type="button"
                      disabled={busyId === auto._id}
                      onClick={() => handleToggle(auto)}
                      className={`rounded px-2 py-0.5 text-xs disabled:opacity-50 ${
                        auto.disponible
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {auto.disponible ? "Disponible" : "Vendido"}
                    </button>
                  </td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      disabled={busyId === auto._id}
                      onClick={() => handleDelete(auto)}
                      className="text-xs text-red-600 hover:underline disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
