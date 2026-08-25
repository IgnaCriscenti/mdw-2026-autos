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
import {
  createAutoSchema,
  listAutosSchema,
  updateAutoSchema,
} from "../schemas/auto.schema.js";

const router = Router();

router.query!("/", validateBody(listAutosSchema), listAutos);
router.get("/:id", getAutoById);
router.post("/", validateBody(createAutoSchema), createAuto);
router.put("/:id", validateBody(updateAutoSchema), updateAuto);
router.delete("/:id", deleteAuto);

export default router;
