// Agrega todos los routers de la v1. Las entidades nuevas se montan acá, no en server.ts.
import { Router } from "express";
import autosRouter from "./autos.routes.js";

const router = Router();

router.use("/autos", autosRouter);

export default router;
