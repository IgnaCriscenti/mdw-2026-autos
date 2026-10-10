import { api } from "../lib/api";
import type { Auto, AutoInput, Paginated } from "../types/auto";

// Públicas ----------------------------------------------------------------

// El listado usa el método QUERY (filtros en el body). axios lo soporta nativo: api.query(url, body).
export const getAutos = async (): Promise<Auto[]> => {
  const { data } = await api.query<Paginated<Auto>>("/autos", {
    sortBy: "marca",
    sortOrder: "asc",
    limit: 100,
  });
  return data.data;
};

// GET /autos/:id devuelve el auto sin envelope (400 si el id es inválido, 404 si no existe).
export const getAutoById = async (id: string): Promise<Auto> => {
  const { data } = await api.get<Auto>(`/autos/${id}`);
  return data;
};

// Sólo ADMIN (el backend responde 401 sin sesión y 403 con otro rol) ----------

export const createAuto = async (auto: AutoInput): Promise<Auto> => {
  const { data } = await api.post<Auto>("/autos", auto);
  return data;
};

export const updateAuto = async (id: string, changes: Partial<AutoInput>): Promise<Auto> => {
  const { data } = await api.put<Auto>(`/autos/${id}`, changes);
  return data;
};

export const deleteAuto = async (id: string): Promise<void> => {
  await api.delete(`/autos/${id}`);
};
