/**
 * HEX 색상을 같은 색조로 더 진하게 만듭니다(HSL 명도는 낮추고 채도는 조금 올림).
 * amount는 0~1 사이 값이며, 명도를 그만큼(절대값) 낮춥니다.
 */
export function darkenHex(hex: string, amount: number): string {
  const value = parseInt(hex.replace('#', ''), 16);
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }

  const nextL = Math.max(0, l - amount);
  const nextS = Math.min(1, s + amount * 0.6);
  return `hsl(${Math.round(h * 360)} ${Math.round(nextS * 100)}% ${Math.round(nextL * 100)}%)`;
}
