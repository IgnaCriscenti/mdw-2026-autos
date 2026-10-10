import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import User, { type IUserDocument } from "../models/User.js";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema.js";
import { clearSessionCookies, setSessionCookies } from "../config/jwt.js";

const SALT_ROUNDS = 10;

// Nunca devolvemos la password (ni el hash) al cliente.
function toPublicUser(user: IUserDocument) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

// POST /api/v1/auth/register — pública. Siempre crea un USER.
export async function registerUser(
  req: Request<{}, {}, RegisterInput>,
  res: Response
): Promise<void> {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ success: false, error: { message: "El email ya está en uso" } });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ success: true, data: toPublicUser(newUser) });
  } catch (error) {
    console.error("[auth] error al registrar:", error);
    res.status(500).json({ success: false, error: { message: "No se pudo registrar el usuario" } });
  }
}

// POST /api/v1/auth/login — pública. Si las credenciales son válidas, setea las cookies httpOnly.
export async function login(req: Request<{}, {}, LoginInput>, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    // Mismo mensaje para "no existe" y "password incorrecta": no revelamos qué emails están registrados.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ success: false, error: { message: "Credenciales inválidas" } });
      return;
    }

    setSessionCookies(res, user._id.toString(), user.role);
    res.status(200).json({ success: true, data: toPublicUser(user) });
  } catch (error) {
    console.error("[auth] error al iniciar sesión:", error);
    res.status(500).json({ success: false, error: { message: "No se pudo iniciar sesión" } });
  }
}

// POST /api/v1/auth/logout — pública (borrar cookies no requiere estar logueado).
export function logout(_req: Request, res: Response): void {
  clearSessionCookies(res);
  res.status(200).json({ success: true, data: { message: "Sesión cerrada" } });
}

// GET /api/v1/auth/me — PRIVADA. El front no puede leer la cookie httpOnly,
// así que le pregunta al backend quién es el usuario de la sesión actual.
export async function me(req: Request, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(401).json({ success: false, error: { message: "Sesión inválida" } });
      return;
    }

    res.status(200).json({ success: true, data: toPublicUser(user) });
  } catch (error) {
    console.error("[auth] error al obtener la sesión:", error);
    res.status(500).json({ success: false, error: { message: "No se pudo obtener la sesión" } });
  }
}
