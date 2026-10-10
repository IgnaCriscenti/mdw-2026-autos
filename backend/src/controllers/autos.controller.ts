import type { Request, Response } from "express";
import { isValidObjectId, type QueryFilter } from "mongoose";
import Auto, {
  FUEL_TYPES,
  type IAuto,
  type IAutoDocument,
  type FuelType,
} from "../models/Auto.js";

const ALLOWED_SORT_FIELDS = ["createdAt", "marca", "modelo", "anio", "precio"] as const;
type SortField = (typeof ALLOWED_SORT_FIELDS)[number];

interface ListAutosFilters {
  marca?: string;
  combustible?: FuelType;
  disponible?: boolean;
  search?: string;
  page: number;
  limit: number;
  sortBy: SortField;
  sortOrder: 1 | -1;
}

// Escapa los metacaracteres de regex para que un término de búsqueda no pueda
// inyectar su propia expresión regular en el filtro $regex de más abajo.
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// QUERY manda los filtros en el body en vez de la URL, así que parseamos y
// validamos req.body a mano (no hay parseo de query string).
function parseListAutosBody(body: unknown): ListAutosFilters | { error: string } {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;

  const page = Number.isInteger(input.page) ? (input.page as number) : 1;
  const limit = Number.isInteger(input.limit) ? (input.limit as number) : 20;

  if (page < 1) {
    return { error: "page debe ser >= 1" };
  }

  if (limit < 1 || limit > 100) {
    return { error: "limit debe estar entre 1 y 100" };
  }

  const sortBy = typeof input.sortBy === "string" ? input.sortBy : "createdAt";

  if (!ALLOWED_SORT_FIELDS.includes(sortBy as SortField)) {
    return { error: `sortBy debe ser uno de: ${ALLOWED_SORT_FIELDS.join(", ")}` };
  }

  const filters: ListAutosFilters = {
    page,
    limit,
    sortBy: sortBy as SortField,
    sortOrder: input.sortOrder === "asc" ? 1 : -1,
  };

  if (typeof input.marca === "string" && input.marca.trim()) {
    filters.marca = input.marca.trim();
  }

  if (typeof input.combustible === "string" && FUEL_TYPES.includes(input.combustible as FuelType)) {
    filters.combustible = input.combustible as FuelType;
  }

  if (typeof input.disponible === "boolean") {
    filters.disponible = input.disponible;
  }

  if (typeof input.search === "string" && input.search.trim()) {
    filters.search = input.search.trim().slice(0, 120);
  }

  return filters;
}

// QUERY /api/v1/autos
// Body de ejemplo: { "marca": "Toyota", "disponible": true, "page": 1, "limit": 20 }
export async function listAutos(req: Request, res: Response): Promise<void> {
  const parsed = parseListAutosBody(req.body);

  if ("error" in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const { marca, combustible, disponible, search, page, limit, sortBy, sortOrder } = parsed;

  // Armamos el filtro sólo con campos de la whitelist — nunca hacer spread de
  // req.body dentro de la query (dejaría inyectar operadores como { "$gt": "" }).
  const filter: QueryFilter<IAutoDocument> = {};
  if (marca) filter.marca = marca;
  if (combustible) filter.combustible = combustible;
  if (disponible !== undefined) filter.disponible = disponible;
  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { marca: { $regex: safeSearch, $options: "i" } },
      { modelo: { $regex: safeSearch, $options: "i" } },
      { patente: { $regex: safeSearch, $options: "i" } },
    ];
  }

  try {
    const skip = (page - 1) * limit;

    const [autos, total] = await Promise.all([
      Auto.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      Auto.countDocuments(filter),
    ]);

    res.status(200).json({
      data: autos,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[autos] error al listar:", error);
    res.status(500).json({ error: "No se pudieron obtener los autos" });
  }
}

export async function getAutoById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "El id enviado no es válido" });
    return;
  }

  try {
    const auto = await Auto.findById(id);

    if (!auto) {
      res.status(404).json({ error: "Auto no encontrado" });
      return;
    }

    res.status(200).json(auto);
  } catch (error) {
    console.error("[autos] error al buscar:", error);
    res.status(500).json({ error: "No se pudo obtener el auto" });
  }
}

export async function createAuto(
  req: Request<{}, {}, Partial<IAuto>>,
  res: Response
): Promise<void> {
  try {
    const newAuto = await Auto.create(req.body);
    res.status(201).json(newAuto);
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ error: error.message });
      return;
    }

    // 11000 = índice único duplicado (patente repetida)
    if (typeof error === "object" && error !== null && (error as { code?: number }).code === 11000) {
      res.status(409).json({ error: "Ya existe un auto con esa patente" });
      return;
    }

    console.error("[autos] error al crear:", error);
    res.status(500).json({ error: "No se pudo crear el auto" });
  }
}

export async function updateAuto(
  req: Request<{ id: string }, {}, Partial<IAuto>>,
  res: Response
): Promise<void> {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "El id enviado no es válido" });
    return;
  }

  try {
    const updatedAuto = await Auto.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedAuto) {
      res.status(404).json({ error: "Auto no encontrado" });
      return;
    }

    res.status(200).json(updatedAuto);
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ error: error.message });
      return;
    }

    if (typeof error === "object" && error !== null && (error as { code?: number }).code === 11000) {
      res.status(409).json({ error: "Ya existe un auto con esa patente" });
      return;
    }

    console.error("[autos] error al actualizar:", error);
    res.status(500).json({ error: "No se pudo actualizar el auto" });
  }
}

export async function deleteAuto(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "El id enviado no es válido" });
    return;
  }

  try {
    const deletedAuto = await Auto.findByIdAndDelete(id);

    if (!deletedAuto) {
      res.status(404).json({ error: "Auto no encontrado" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("[autos] error al eliminar:", error);
    res.status(500).json({ error: "No se pudo eliminar el auto" });
  }
}
