import { test, expect } from '@playwright/test';

// 初回訪問のイントロモーダルを抑制
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('ai-brainstorm-welcomed', '1');
    localStorage.setItem('ai-brainstorm-visited', 'true');
  });
  await page.goto('/');
});

test.describe('スモークテスト', () => {
  test('アプリが正常に読み込まれる', async ({ page }) => {
    await expect(page).toHaveTitle(/BrainBrainBrain/);
    await expect(page.locator('h1')).toContainText('BrainBrainBrain');
  });

  test('ロゴが表示される', async ({ page }) => {
    const logo = page.locator('[title="BrainBrainBrain"]');
    await expect(logo).toBeVisible();
  });

  test('フォームの主要要素が表示される', async ({ page }) => {
    // セッションタイプ（PurposeCards 内のボタン）
    await expect(page.getByText('成約・売上を伸ばす')).toBeVisible();
    // サービス名入力
    await expect(page.getByPlaceholder('プロダクト / サービスカテゴリ名')).toBeVisible();
    // 目標入力
    await expect(page.getByText('チーム目標')).toBeVisible();
    // 生成ボタン
    await expect(page.getByRole('button', { name: /戦略アイデア生成/ })).toBeVisible();
  });

  test('Seedボタンからサンプルデータを投入できる', async ({ page }) => {
    const seedBtn = page.getByRole('button', { name: 'Seedデータ選択' });
    await seedBtn.hover();
    // ドロップダウンが表示される
    const dropdown = page.locator('[data-tour="seed"] + div, .absolute.right-0.top-full');
    await expect(dropdown.first()).toBeVisible({ timeout: 3000 });
    // 最初のシナリオをクリック
    await dropdown.first().locator('button').first().click();
    // フォームにデータが入る
    const serviceInput = page.getByPlaceholder('プロダクト / サービスカテゴリ名');
    await expect(serviceInput).not.toHaveValue('');
  });
});
