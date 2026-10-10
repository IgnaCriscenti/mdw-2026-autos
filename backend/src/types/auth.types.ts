// Tipos compartidos de autenticación (payload de los JWT y roles).
export const USER_ROLES = ["ADMIN", "USER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

// Extiende el Request de Express: authMiddleware deja acá quién hizo la request.
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: UserRole;
    }
  }
}
