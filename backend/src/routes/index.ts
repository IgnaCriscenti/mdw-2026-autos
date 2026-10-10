// Agrega todos los routers de la v1. Las entidades nuevas se montan acá, no en server.ts.
import { Router } from "express";
import autosRouter from "./autos.routes.js";
import authRouter from "./auth.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/autos", autosRouter);

export default router;
