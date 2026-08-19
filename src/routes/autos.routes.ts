// Mapeo entre (método HTTP + path) y controller. Acá no va lógica de negocio.
import { Router } from "express";
import {
  listAutos,
  getAutoById,
  createAuto,
  updateAuto,
  deleteAuto,
} from "../controllers/autos.controller.js";

const router = Router();

router.query!("/", listAutos);
router.get("/:id", getAutoById);
router.post("/", createAuto);
router.put("/:id", updateAuto);
router.delete("/:id", deleteAuto);

export default router;
