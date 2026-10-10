# mdw-2026-autos

Catálogo de autos full stack — Programación Web Full Stack 2026.

Stack: Node.js + Express + TypeScript · MongoDB + Mongoose · Zod · bcrypt + JWT en cookie `httpOnly` · React + Vite + React Router + Tailwind.

## Estructura

```
backend/    -> API Express + MongoDB (puerto 3000)
frontend/   -> React + Vite (puerto 5173)
```

Cada proyecto tiene su propio `package.json`, `node_modules` y `.env`: los comandos `npm` se corren
dentro de `backend/` o `frontend/`, no en la raíz.

## Cómo correrlo

```bash
# 1) Backend
cd backend
cp .env.example .env          # completar JWT_SECRET, JWT_REFRESH_SECRET y MONGODB_URI
npm install
npm run seed:admin            # crea el usuario ADMIN definido en el .env
npm run dev

# 2) Frontend (otra terminal)
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:3000/api/v1
npm install
npm run dev
```

Abrir http://localhost:5173.

---

## Rutas públicas, privadas y protegidas por rol

Tres niveles de acceso, implementados en los dos lados. **El front esconde, el back protege**: el guard
de React es UX; la seguridad real está en los middlewares del backend.

### Frontend (React Router)

| Ruta | Acceso | Qué muestra |
|---|---|---|
| `/login`, `/register` | Pública | Formularios de sesión (sin Layout) |
| `/` | Redirige a `/home` | — |
| `/home` | **Pública** | Catálogo de autos |
| `/autos/:id` | **Pública** | Detalle de un auto (`useParams`) |
| `/perfil` | **Privada** (cualquier usuario logueado) | Datos del usuario de la sesión |
| `/admin` | **Privada por rol** (`ADMIN`) | Panel: marcar vendido/disponible, eliminar |
| `/admin/autos/nuevo` | **Privada por rol** (`ADMIN`) | Alta de un auto |
| `*` | Pública | 404 |

El árbol está en `frontend/src/router/index.tsx`. Las rutas privadas cuelgan de un
`<ProtectedRoute />` (ruta "layout" sin `path`) que decide:

```
loading           → "Verificando sesión..."          (todavía no respondió GET /auth/me)
sin user          → <Navigate to="/login" state={{ from }} />   (después del login vuelve a donde iba)
rol no permitido  → pantalla 403 "Acceso denegado"
ok                → <Outlet />                        (renderiza la ruta hija)
```

Uso: `<ProtectedRoute />` (sólo sesión) o `<ProtectedRoute roles={["ADMIN"]} />` (sesión + rol).

La sesión vive en un **Context** (`frontend/src/auth/`): como el JWT está en una cookie `httpOnly`, JS
no puede leerla; `AuthProvider` pregunta `GET /auth/me` al montar y expone `{ user, loading, login, logout }`
a través de `useAuth()`. Un interceptor de axios limpia la sesión ante cualquier `401`.

### Backend (Express)

| Método | Endpoint | Acceso | Middlewares |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Pública | `validateBody` |
| `POST` | `/api/v1/auth/login` | Pública | `validateBody` |
| `POST` | `/api/v1/auth/logout` | Pública | — |
| `GET` | `/api/v1/auth/me` | **Privada** | `authMiddleware` |
| `QUERY` | `/api/v1/autos` | Pública | `validateBody` |
| `GET` | `/api/v1/autos/:id` | Pública | — |
| `POST` | `/api/v1/autos` | **Privada por rol** (`ADMIN`) | `authMiddleware` → `requireRole("ADMIN")` → `validateBody` |
| `PUT` | `/api/v1/autos/:id` | **Privada por rol** (`ADMIN`) | `authMiddleware` → `requireRole("ADMIN")` → `validateBody` |
| `DELETE` | `/api/v1/autos/:id` | **Privada por rol** (`ADMIN`) | `authMiddleware` → `requireRole("ADMIN")` |

- `authMiddleware` (`backend/src/middlewares/auth.middleware.ts`): verifica el `accessToken` de la cookie;
  si venció, lo renueva con el `refreshToken`. Sin sesión válida → **401**.
- `requireRole(...roles)`: va siempre después de `authMiddleware`. Rol no permitido → **403**.

### Roles

`/register` crea siempre `USER`: el schema de Zod descarta cualquier `role` que mande el cliente y el
modelo tiene `default: "USER"`. Para tener un `ADMIN`:

- `npm run seed:admin` (dentro de `backend/`), que usa `ADMIN_EMAIL` / `ADMIN_PASSWORD` del `.env`; o
- a mano en la base: `db.users.updateOne({ email: "..." }, { $set: { role: "ADMIN" } })` y volver a loguearse.

### Cómo probarlo

1. Sin loguearse: `/home` y `/autos/:id` se ven; `/perfil` y `/admin` redirigen a `/login`.
2. Registrarse (queda `USER`): `/perfil` se ve; `/admin` muestra **403**.
3. Ingresar con el admin del seed: `/admin` se ve y se pueden crear, editar y borrar autos.
4. Con Postman, `POST /api/v1/autos` sin cookie → `401`; logueado como `USER` → `403`.
