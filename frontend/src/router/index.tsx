// Árbol de rutas centralizado (data router). Tres niveles de acceso:
//   PÚBLICAS            → /login, /register, /home, /autos/:id
//   PRIVADAS            → /perfil                         (cualquier usuario logueado)
//   PROTEGIDAS POR ROL  → /admin, /admin/autos/nuevo      (sólo ADMIN)
import { createBrowserRouter, redirect } from "react-router";
import { Layout } from "../layouts/Layout";
import { ProtectedRoute } from "./ProtectedRoute";
import { Home } from "../pages/Home";
import { AutoDetail } from "../pages/AutoDetail";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Profile } from "../pages/Profile";
import { Admin } from "../pages/Admin";
import { AdminNewAuto } from "../pages/AdminNewAuto";
import { NotFound } from "../pages/NotFound";

export const router = createBrowserRouter([
  // Públicas, fuera del Layout: pantalla completa, sin header
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    path: "/",
    element: <Layout />,
    children: [
      // Redirección fija: el loader corre antes de renderizar
      { index: true, loader: () => redirect("/home") },

      // Públicas: catálogo y detalle (useParams lee :id)
      { path: "home", element: <Home /> },
      { path: "autos/:id", element: <AutoDetail /> },

      // Privada: cualquier usuario autenticado
      {
        element: <ProtectedRoute />,
        children: [{ path: "perfil", element: <Profile /> }],
      },

      // Privada protegida por rol: sólo ADMIN
      {
        element: <ProtectedRoute roles={["ADMIN"]} />,
        children: [
          // Ruta sin element: sólo agrupa por URL (/admin, /admin/autos/nuevo)
          {
            path: "admin",
            children: [
              { index: true, element: <Admin /> },
              { path: "autos/nuevo", element: <AdminNewAuto /> },
            ],
          },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);
