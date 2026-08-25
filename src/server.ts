import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import v1Router from "./routes/index.js";
import { connectMongoDB } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS: sólo el front declarado en CORS_ORIGIN puede llamar a esta API desde el navegador.
// credentials habilita el envío de cookies, que hace falta a partir de la clase de auth.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("¡Servidor funcionando!");
});

// Todas las rutas de la API cuelgan de /api/v1
app.use("/api/v1", v1Router);

async function bootstrap(): Promise<void> {
  // Conectamos a Mongo ANTES de escuchar, así el server nunca acepta
  // requests que no va a poder responder.
  await connectMongoDB();

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("No se pudo iniciar el servidor:", error);
  process.exit(1);
});
