// Layout: header con navegación. Se monta una sola vez; al navegar sólo cambia lo que renderiza <Outlet />.
// Los links se muestran según la sesión, pero ocultarlos NO protege nada: eso lo hace ProtectedRoute.
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../auth/useAuth";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-1.5 text-sm transition hover:bg-white/10 ${isActive ? "bg-white/15 font-medium" : ""}`;

export const Layout = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/home", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-brand-600 px-6 py-4 text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <Link to="/home" className="text-2xl font-bold">
            Autos
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/home" className={navLinkClass}>
              Catálogo
            </NavLink>
            {user && (
              <NavLink to="/perfil" className={navLinkClass}>
                Mi perfil
              </NavLink>
            )}
            {user?.role === "ADMIN" && (
              <NavLink to="/admin" className={navLinkClass}>
                Admin
              </NavLink>
            )}
            {!loading &&
              (user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded px-3 py-1.5 text-sm hover:bg-white/10"
                >
                  Salir ({user.name})
                </button>
              ) : (
                <NavLink to="/login" className={navLinkClass}>
                  Ingresar
                </NavLink>
              ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">
        <Outlet />
      </main>
    </div>
  );
};
