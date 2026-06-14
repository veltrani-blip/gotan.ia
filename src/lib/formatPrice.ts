// Formata preço em USD; zero vira "Grátis".
export function formatPrice(value: number): string {
  if (value === 0) return "Grátis";
  return `$${value.toFixed(2)}`;
}
