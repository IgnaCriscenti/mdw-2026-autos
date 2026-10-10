// Misma forma que IAuto en el backend (backend/src/models/Auto.ts). El JSON no trae tipos: los declaramos a mano.
export const FUEL_TYPES = ["nafta", "diesel", "gnc", "hibrido", "electrico"] as const;
export type FuelType = (typeof FUEL_TYPES)[number];

export interface AutoInput {
  marca: string;
  modelo: string;
  anio: number;
  patente: string;
  precio: number;
  kilometraje: number;
  combustible: FuelType;
  disponible: boolean;
}

export interface Auto extends AutoInput {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// Envelope de los listados paginados del backend: { data, meta }.
export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
