import { z } from "zod";
import { FUEL_TYPES } from "../models/Auto.js";

export const ALLOWED_SORT_FIELDS = ["createdAt", "marca", "modelo", "anio", "precio"] as const;

const PATENTE_REGEX = /^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/;

// Filtros del listado (llegan por body porque el método es QUERY).
export const listAutosSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(ALLOWED_SORT_FIELDS).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  marca: z.string().trim().min(1).optional(),
  combustible: z.enum(FUEL_TYPES).optional(),
  disponible: z.boolean().optional(),
  search: z.string().trim().min(1).max(120).optional(),
});

export const createAutoSchema = z.object({
  marca: z.string().trim().min(1, "La marca es obligatoria").max(60),
  modelo: z.string().trim().min(1, "El modelo es obligatorio").max(60),
  anio: z
    .number()
    .int("El año debe ser un número entero")
    .min(1900, "El año no puede ser anterior a 1900")
    .max(new Date().getFullYear() + 1, "El año no puede ser futuro"),
  patente: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PATENTE_REGEX, "Formato de patente inválido (AAA123 o AB123CD)"),
  precio: z.number().min(0, "El precio no puede ser negativo"),
  kilometraje: z.number().min(0, "El kilometraje no puede ser negativo").optional(),
  combustible: z.enum(FUEL_TYPES),
  disponible: z.boolean().optional(),
});

// PUT parcial: todos los campos opcionales, pero los que vengan se validan igual.
export const updateAutoSchema = createAutoSchema.partial();

export type ListAutosInput = z.infer<typeof listAutosSchema>;
export type CreateAutoInput = z.infer<typeof createAutoSchema>;
export type UpdateAutoInput = z.infer<typeof updateAutoSchema>;
