export const CURRENCY = "AED ";

export const PRESET_PLAYERS: Record<string, Array<{ name: string; number: string }>> = {
  "ARGENTINA AWAY": [{ name: "MESSI", number: "10" }],
  "BRAZIL AWAY": [{ name: "NEYMAR", number: "10" }, { name: "VINI", number: "7" }, { name: "RAPHINHA", number: "11" }],
  "FRANCE AWAY": [{ name: "MBAPPE", number: "10" }, { name: "OLISE", number: "11" }, { name: "DEMBELE", number: "7" }],
  "PORTUGAL AWAY": [{ name: "RONALDO", number: "7" }],
  "SPAIN AWAY": [{ name: "LAMINE YAMAL", number: "19" }, { name: "PEDRI", number: "20" }],
  "ARGENTINA HOME": [{ name: "MESSI", number: "10" }],
  "BRAZIL HOME": [{ name: "NEYMAR", number: "10" }],
  "FRANCE HOME": [{ name: "MBAPPE", number: "10" }, { name: "DEMBELE", number: "7" }],
  "PORTUGAL HOME": [{ name: "RONALDO", number: "7" }],
  "SPAIN HOME": [{ name: "LAMINE YAMAL", number: "19" }, { name: "PEDRI", number: "20" }],
};

export function isCustomJersey(item: { name: string; customName?: string; customNumber?: string }) {
  const name = (item.customName || "").trim().toUpperCase();
  const num = (item.customNumber || "").trim();
  if (!name && !num) return false;

  const normalizedProduct = item.name.toUpperCase().replace(/\s+KIT.*$/i, "").trim();
  const presets = PRESET_PLAYERS[normalizedProduct] || [];
  const isPreset = presets.some(p => p.name === name && p.number === num);
  return !isPreset;
}
