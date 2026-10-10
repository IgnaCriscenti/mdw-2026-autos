// Firma de tokens y cookies de sesión. Lo usan el controller de auth y el middleware.
import type { Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { JwtPayload, UserRole } from "../types/auth.types.js";

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000; // 15 minutos
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

function getEnv(name: "JWT_SECRET" | "JWT_REFRESH_SECRET"): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name} (ver .env.example)`);
  return value;
}

const cookieOptions = (maxAge: number) => ({
  httpOnly: true, // JS del navegador no puede leerla → protege contra XSS
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge,
});

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, getEnv("JWT_SECRET"), {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "15m",
  } as SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, getEnv("JWT_SECRET")) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, getEnv("JWT_REFRESH_SECRET")) as JwtPayload;
}

export function setAccessCookie(res: Response, payload: JwtPayload): void {
  res.cookie("accessToken", signAccessToken(payload), cookieOptions(ACCESS_TOKEN_MAX_AGE_MS));
}

export function setSessionCookies(res: Response, userId: string, role: UserRole): void {
  const payload: JwtPayload = { userId, role };

  const refreshToken = jwt.sign(payload, getEnv("JWT_REFRESH_SECRET"), {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  } as SignOptions);

  setAccessCookie(res, payload);
  res.cookie("refreshToken", refreshToken, cookieOptions(REFRESH_TOKEN_MAX_AGE_MS));
}

export function clearSessionCookies(res: Response): void {
  const { maxAge: _ignored, ...options } = cookieOptions(0);
  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);
}
