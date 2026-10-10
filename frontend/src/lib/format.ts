const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const integer = new Intl.NumberFormat("es-AR");

export const formatPrice = (value: number): string => currency.format(value);
export const formatKm = (value: number): string => `${integer.format(value)} km`;
