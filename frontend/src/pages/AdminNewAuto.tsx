// Ruta PROTEGIDA POR ROL "/admin/autos/nuevo": hereda el guard ADMIN de su rama (/admin/*).
import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router";
import { getErrorMessage } from "../lib/api";
import { createAuto } from "../services/autos";
import { FUEL_TYPES, type FuelType } from "../types/auto";

interface FormState {
  marca: string;
  modelo: string;
  anio: string;
  patente: string;
  precio: string;
  kilometraje: string;
  combustible: FuelType;
  disponible: boolean;
}

const initialState: FormState = {
  marca: "",
  modelo: "",
  anio: String(new Date().getFullYear()),
  patente: "",
  precio: "",
  kilometraje: "0",
  combustible: "nafta",
  disponible: true,
};

const inputClass = "rounded border border-slate-300 px-3 py-2";
const labelClass = "flex flex-col gap-1 text-sm text-slate-700";

export const AdminNewAuto = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const nextValue = type === "checkbox" ? (event.target as HTMLInputElement).checked : value;
    setForm((current) => ({ ...current, [name]: nextValue }));
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // Los inputs devuelven strings; el backend (Zod) espera números.
      await createAuto({
        ...form,
        anio: Number(form.anio),
        precio: Number(form.precio),
        kilometraje: Number(form.kilometraje),
        patente: form.patente.toUpperCase(),
      });
      navigate("/admin");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <Link to="/admin" className="text-sm text-slate-500 underline">
        Volver al panel
      </Link>
      <h2 className="mt-2 mb-4 text-xl font-semibold text-slate-900">Nuevo auto</h2>
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Marca
          <input
            name="marca"
            required
            maxLength={60}
            value={form.marca}
            onChange={handleChange}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Modelo
          <input
            name="modelo"
            required
            maxLength={60}
            value={form.modelo}
            onChange={handleChange}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Año
          <input
            name="anio"
            type="number"
            required
            min={1900}
            max={new Date().getFullYear() + 1}
            value={form.anio}
            onChange={handleChange}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Patente (AAA123 o AB123CD)
          <input
            name="patente"
            required
            pattern="[A-Za-z]{3}[0-9]{3}|[A-Za-z]{2}[0-9]{3}[A-Za-z]{2}"
            value={form.patente}
            onChange={handleChange}
            className={`${inputClass} font-mono uppercase`}
          />
        </label>
        <label className={labelClass}>
          Precio (ARS)
          <input
            name="precio"
            type="number"
            required
            min={0}
            value={form.precio}
            onChange={handleChange}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Kilometraje
          <input
            name="kilometraje"
            type="number"
            min={0}
            value={form.kilometraje}
            onChange={handleChange}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Combustible
          <select
            name="combustible"
            value={form.combustible}
            onChange={handleChange}
            className={inputClass}
          >
            {FUEL_TYPES.map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuel}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
          <input
            name="disponible"
            type="checkbox"
            checked={form.disponible}
            onChange={handleChange}
          />
          Disponible
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600 sm:col-span-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-slate-900 py-2 font-medium text-white transition hover:bg-slate-700 disabled:opacity-50 sm:col-span-2"
        >
          {submitting ? "Guardando..." : "Guardar auto"}
        </button>
      </form>
    </section>
  );
};
