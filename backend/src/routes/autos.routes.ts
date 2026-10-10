// Mapeo entre (método HTTP + path) y controller. Acá no va lógica de negocio.
import { Router } from "express";
import {
  listAutos,
  getAutoById,
  createAuto,
  updateAuto,
  deleteAuto,
} from "../controllers/autos.controller.js";
import { validateBody } from "../middlewares/validate.js";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware.js";
import {
  createAutoSchema,
  listAutosSchema,
  updateAutoSchema,
} from "../schemas/auto.schema.js";

const router = Router();

// Públicas: cualquiera puede ver el catálogo.
router.query!("/", validateBody(listAutosSchema), listAutos);
router.get("/:id", getAutoById);

// Protegidas por rol: sólo ADMIN puede modificar el catálogo.
// El orden importa: authMiddleware (¿quién sos?) → requireRole (¿podés?) → validación → controller.
const onlyAdmin = [authMiddleware, requireRole("ADMIN")];

router.post("/", ...onlyAdmin, validateBody(createAutoSchema), createAuto);
router.put("/:id", ...onlyAdmin, validateBody(updateAutoSchema), updateAuto);
router.delete("/:id", ...onlyAdmin, deleteAuto);

export default router;
