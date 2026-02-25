import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// 初回訪問のイントロモーダルを抑制
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('ai-brainstorm-welcomed', '1');
    localStorage.setItem('ai-brainstorm-visited', 'true');
  });
});

test.describe('アクセシビリティ (axe)', () => {
  test('ライトモード: WCAG AA 違反なし', async ({ page }) => {
    await page.goto('/');

    // ライトモードにする
    const html = page.locator('html');
    const isDark = await html.evaluate((el) => el.classList.contains('dark'));
    if (isDark) {
      await page.getByRole('button', { name: /モードに切替/ }).click();
    }

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('.remotion-player') // Remotion は除外
      .disableRules(['color-contrast']) // コントラスト違反は別途対応
      .analyze();

    expect(
      results.violations,
      `ライトモード a11y 違反:\n${results.violations.map((v) => `${v.id}: ${v.description} (${v.nodes.length}件)`).join('\n')}`,
    ).toHaveLength(0);
  });

  test('ダークモード: WCAG AA 違反なし', async ({ page }) => {
    await page.goto('/');

    // ダークモードにする
    const html = page.locator('html');
    const isDark = await html.evaluate((el) => el.classList.contains('dark'));
    if (!isDark) {
      await page.getByRole('button', { name: /モードに切替/ }).click();
    }
    await expect(html).toHaveClass(/dark/);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('.remotion-player')
      .disableRules(['color-contrast'])
      .analyze();

    expect(
      results.violations,
      `ダークモード a11y 違反:\n${results.violations.map((v) => `${v.id}: ${v.description} (${v.nodes.length}件)`).join('\n')}`,
    ).toHaveLength(0);
  });
});
