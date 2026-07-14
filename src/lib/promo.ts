export const VALID_PROMO_CODES: Record<string, number> = {
  KORA10: 0.10, // 10% discount
};

export function getPromoDiscount(code: string): number {
  if (!code) return 0;
  const normalizedCode = code.trim().toUpperCase();
  return VALID_PROMO_CODES[normalizedCode] || 0;
}
