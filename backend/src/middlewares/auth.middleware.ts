// Middlewares de acceso:
//   authMiddleware → ruta PRIVADA: exige sesión válida (accessToken o, si venció, refreshToken).
//   requireRole    → ruta PROTEGIDA POR ROL: además de sesión, exige uno de los roles indicados.
import type { Request, Response, NextFunction } from "express";
import {
  setAccessCookie,
  verifyAccessToken,
  verifyRefreshToken,
} from "../config/jwt.js";
import type { UserRole } from "../types/auth.types.js";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const accessToken: unknown = req.cookies?.accessToken;

  if (typeof accessToken === "string") {
    try {
      const decoded = verifyAccessToken(accessToken);
      req.userId = decoded.userId;
      req.userRole = decoded.role;
      next();
      return;
    } catch {
      // accessToken vencido o inválido: probamos renovarlo con el refreshToken.
    }
  }

  renewFromRefreshToken(req, res, next);
}

function renewFromRefreshToken(req: Request, res: Response, next: NextFunction): void {
  const refreshToken: unknown = req.cookies?.refreshToken;

  if (typeof refreshToken !== "string") {
    res.status(401).json({ success: false, error: { message: "Sesión requerida" } });
    return;
  }

  try {
    const { userId, role } = verifyRefreshToken(refreshToken);
    setAccessCookie(res, { userId, role });
    req.userId = userId;
    req.userRole = role;
    next();
  } catch {
    res.status(401).json({ success: false, error: { message: "Sesión inválida o expirada" } });
  }
}

// Siempre va DESPUÉS de authMiddleware: asume que req.userRole ya está seteado.
// 401 = no sé quién sos · 403 = sé quién sos, pero no tenés permiso.
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      res.status(401).json({ success: false, error: { message: "Sesión requerida" } });
      return;
    }

    if (!allowedRoles.includes(req.userRole)) {
      res.status(403).json({
        success: false,
        error: { message: "No tenés permisos para realizar esta acción" },
      });
      return;
    }

    next();
  };
}
