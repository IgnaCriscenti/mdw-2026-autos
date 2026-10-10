// Crea (o promueve) un usuario ADMIN para poder probar las rutas protegidas por rol.
// Uso: npm run seed:admin  (toma ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD del .env)
// /register siempre crea USER a propósito: un rol con permisos no se elige desde el cliente.
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { connectMongoDB, disconnectMongoDB } from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

async function seedAdmin(): Promise<void> {
  const name = process.env.ADMIN_NAME ?? "Administrador";
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Definí ADMIN_EMAIL y ADMIN_PASSWORD en el .env");
  }

  await connectMongoDB();

  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = "ADMIN";
    await existing.save();
    console.log(`[seed] ${email} ya existía: ahora es ADMIN`);
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword, role: "ADMIN" });
    console.log(`[seed] ADMIN creado: ${email}`);
  }

  await disconnectMongoDB();
}

seedAdmin().catch(async (error) => {
  console.error("[seed] no se pudo crear el admin:", error);
  await disconnectMongoDB().catch(() => {});
  process.exit(1);
});
