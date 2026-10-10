import { Schema, model, Document, Model, Types } from "mongoose";

export const FUEL_TYPES = ["nafta", "diesel", "gnc", "hibrido", "electrico"] as const;
export type FuelType = (typeof FUEL_TYPES)[number];

export interface IAuto {
  marca: string;
  modelo: string;
  anio: number;
  patente: string;
  precio: number;
  kilometraje: number;
  combustible: FuelType;
  disponible: boolean;
}

export interface IAutoDocument extends IAuto, Document {
  _id: Types.ObjectId;
}

const autoSchema = new Schema<IAutoDocument>(
  {
    marca: {
      type: String,
      required: [true, "La marca es obligatoria"],
      trim: true,
      maxlength: [60, "La marca no puede superar los 60 caracteres"],
    },
    modelo: {
      type: String,
      required: [true, "El modelo es obligatorio"],
      trim: true,
      maxlength: [60, "El modelo no puede superar los 60 caracteres"],
    },
    anio: {
      type: Number,
      required: [true, "El año es obligatorio"],
      min: [1900, "El año no puede ser anterior a 1900"],
      max: [new Date().getFullYear() + 1, "El año no puede ser futuro"],
    },
    patente: {
      type: String,
      required: [true, "La patente es obligatoria"],
      trim: true,
      uppercase: true,
      unique: true,
      // AAA123 (vieja) o AB123CD (Mercosur)
      match: [/^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/, "Formato de patente inválido"],
    },
    precio: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
    },
    kilometraje: {
      type: Number,
      default: 0,
      min: [0, "El kilometraje no puede ser negativo"],
    },
    combustible: {
      type: String,
      required: [true, "El combustible es obligatorio"],
      enum: {
        values: FUEL_TYPES,
        message: `El combustible debe ser uno de: ${FUEL_TYPES.join(", ")}`,
      },
    },
    disponible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Auto: Model<IAutoDocument> = model<IAutoDocument>("Auto", autoSchema);

export default Auto;
