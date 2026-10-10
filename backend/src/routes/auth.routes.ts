// Mapeo entre (método HTTP + path) y controller. Acá no va lógica de negocio.
import { Router } from "express";
import { registerUser, login, logout, me } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";

const router = Router();

// Públicas
router.post("/register", validateBody(registerSchema), registerUser);
router.post("/login", validateBody(loginSchema), login);
router.post("/logout", logout);

// Privada: cualquier usuario autenticado
router.get("/me", authMiddleware, me);

export default router;
