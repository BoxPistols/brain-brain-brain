import { describe, it, expect } from 'vitest';

// ── sRGB → 相対輝度 ──
function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// ── WCAG コントラスト比 ──
function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ── α 合成（fg を bg 上に重ねた結果色） ──
function alphaBlend(fg: string, alpha: number, bg: string): string {
  const parse = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [fr, fg2, fb] = parse(fg);
  const [br, bg2, bb] = parse(bg);
  const blend = (f: number, b: number) => Math.round(f * alpha + b * (1 - alpha));
  const rr = blend(fr, br).toString(16).padStart(2, '0');
  const gg = blend(fg2, bg2).toString(16).padStart(2, '0');
  const bbb = blend(fb, bb).toString(16).padStart(2, '0');
  return `#${rr}${gg}${bbb}`;
}

// ── ブランドカラー定義 ──
const BRAND = '#4F46E5';
const BRAND_LIGHT = '#818CF8';
const BRAND_DARK = '#4338CA';
const BRAND_50 = '#EEF2FF';
const ACCENT = '#D97706';
const ACCENT_LIGHT = '#FBBF24';

const LIGHT_BG = '#F8FAFC'; // slate-50
const DARK_BG = '#020617'; // slate-950
const CARD_LIGHT = '#FFFFFF';
const CARD_DARK = '#0F172A'; // slate-900
const TEXT_LIGHT = '#0F172A'; // slate-900 (on light)
const TEXT_DARK = '#F1F5F9'; // slate-100 (on dark)

// WCAG AA: 通常テキスト ≥ 4.5, 大きいテキスト/UI ≥ 3.0
const AA_TEXT = 4.5;
const AA_UI = 3.0;

describe('A11y コントラスト比: ライトモード', () => {
  it('brand テキスト on white カード >= 4.5', () => {
    const ratio = contrastRatio(BRAND, CARD_LIGHT);
    expect(ratio).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('brand-dark テキスト on white カード >= 4.5', () => {
    const ratio = contrastRatio(BRAND_DARK, CARD_LIGHT);
    expect(ratio).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('brand-dark テキスト on brand-50 背景 >= 4.5', () => {
    const ratio = contrastRatio(BRAND_DARK, BRAND_50);
    expect(ratio).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('brand ボーダー on white カード >= 3.0 (UI)', () => {
    const ratio = contrastRatio(BRAND, CARD_LIGHT);
    expect(ratio).toBeGreaterThanOrEqual(AA_UI);
  });

  it('accent テキスト on white >= 3.0 (UI)', () => {
    const ratio = contrastRatio(ACCENT, CARD_LIGHT);
    expect(ratio).toBeGreaterThanOrEqual(AA_UI);
  });

  it('t1 テキスト (slate-900) on slate-50 >= 4.5', () => {
    const ratio = contrastRatio(TEXT_LIGHT, LIGHT_BG);
    expect(ratio).toBeGreaterThanOrEqual(AA_TEXT);
  });
});

describe('A11y コントラスト比: ダークモード', () => {
  it('brand-light テキスト on slate-900 カード >= 4.5', () => {
    const ratio = contrastRatio(BRAND_LIGHT, CARD_DARK);
    expect(ratio).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('brand-light テキスト on slate-950 背景 >= 4.5', () => {
    const ratio = contrastRatio(BRAND_LIGHT, DARK_BG);
    expect(ratio).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('brand-light ボーダー on slate-900 >= 3.0 (UI)', () => {
    const ratio = contrastRatio(BRAND_LIGHT, CARD_DARK);
    expect(ratio).toBeGreaterThanOrEqual(AA_UI);
  });

  it('brand bg(10%) on slate-900 ボーダー視認性 >= 3.0 (UI)', () => {
    const blended = alphaBlend(BRAND, 0.1, CARD_DARK);
    const ratio = contrastRatio(BRAND_LIGHT, blended);
    expect(ratio).toBeGreaterThanOrEqual(AA_UI);
  });

  it('accent-light テキスト on slate-900 >= 4.5', () => {
    const ratio = contrastRatio(ACCENT_LIGHT, CARD_DARK);
    expect(ratio).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('t1 テキスト (slate-100) on slate-950 >= 4.5', () => {
    const ratio = contrastRatio(TEXT_DARK, DARK_BG);
    expect(ratio).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('t3 テキスト (slate-400) on slate-900 カード >= 3.0 (UI)', () => {
    const SLATE_400 = '#94A3B8';
    const ratio = contrastRatio(SLATE_400, CARD_DARK);
    expect(ratio).toBeGreaterThanOrEqual(AA_UI);
  });

  it('t3 テキスト (slate-400) on slate-950 背景 >= 3.0 (UI)', () => {
    const SLATE_400 = '#94A3B8';
    const ratio = contrastRatio(SLATE_400, DARK_BG);
    expect(ratio).toBeGreaterThanOrEqual(AA_UI);
  });
});

describe('A11y コントラスト比: ロゴ', () => {
  it('白 B on brand 背景 >= 4.5', () => {
    const ratio = contrastRatio('#FFFFFF', BRAND);
    expect(ratio).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('accent-light ³ on brand 背景 >= 3.0 (装飾UI)', () => {
    const ratio = contrastRatio(ACCENT_LIGHT, BRAND);
    expect(ratio).toBeGreaterThanOrEqual(AA_UI);
  });
});
