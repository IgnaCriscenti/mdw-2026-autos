import { Schema, model, Document, Model, Types } from "mongoose";
import { USER_ROLES, type UserRole } from "../types/auth.types.js";

export interface IUser {
  name: string;
  email: string;
  password: string; // siempre hasheada con bcrypt, nunca en texto plano
  role: UserRole;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      maxlength: [80, "El nombre no puede superar los 80 caracteres"],
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
    },
    role: {
      type: String,
      enum: USER_ROLES,
      // Todo usuario nuevo es USER. ADMIN se asigna a mano (ver README / npm run seed:admin).
      default: "USER",
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUserDocument> = model<IUserDocument>("User", userSchema);

export default User;
