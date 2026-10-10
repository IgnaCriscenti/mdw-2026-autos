// Guard de rutas. Se usa como "ruta layout" sin path: envuelve a sus hijas y decide si se renderizan.
//   <ProtectedRoute />                  → ruta PRIVADA (cualquier usuario autenticado)
//   <ProtectedRoute roles={["ADMIN"]} /> → ruta PRIVADA PROTEGIDA POR ROL
// El front esconde, el back protege: esto es UX; la seguridad real son authMiddleware + requireRole.
import { Link, Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../auth/useAuth";
import type { UserRole } from "../types/auth";

interface ProtectedRouteProps {
  roles?: UserRole[];
}

export const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1) Todavía no sabemos si hay sesión (GET /auth/me en curso): esperamos.
  if (loading) {
    return <p className="text-slate-500">Verificando sesión...</p>;
  }

  // 2) Sin sesión → al login, recordando a dónde quería ir para volver después.
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3) Con sesión pero sin el rol requerido → 403 (no lo mandamos al login: ya está logueado).
  if (roles && !roles.includes(user.role)) {
    return (
      <section className="rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-red-700">403 — Acceso denegado</h2>
        <p className="mt-1 text-slate-600">
          Esta sección requiere el rol {roles.join(" o ")}. Tu rol es {user.role}.
        </p>
        <Link to="/home" className="mt-3 inline-block text-slate-600 underline">
          Volver al catálogo
        </Link>
      </section>
    );
  }

  // 4) OK: renderiza la ruta hija.
  return <Outlet />;
};
