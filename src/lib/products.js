// Prodotti mock con swatch vivaci
export const SWATCHES = [
  "linear-gradient(135deg,#5B93D6,#2C5F9E)",
  "linear-gradient(135deg,#D6F26B,#8FB93B)",
  "linear-gradient(135deg,#F7A8C0,#E8708F)",
  "linear-gradient(135deg,#FBD34D,#E39A0B)",
  "linear-gradient(135deg,#46C7AE,#127C68)",
  "linear-gradient(135deg,#B98CE6,#7D4FC0)",
];

export function mockProducts(c) {
  return c.tags.slice(0, 4).map((t, i) => ({
    id: c.id + "-p" + i,
    name: t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(),
    moq: "Su richiesta",
    swatch: SWATCHES[(t.length + i) % SWATCHES.length],
  }));
}
