import { test, expect } from '@playwright/test';

// 初回訪問のイントロモーダルを抑制
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('ai-brainstorm-welcomed', '1');
    localStorage.setItem('ai-brainstorm-visited', 'true');
  });
});

test.describe('ダークモード', () => {
  test('テーマ切替でダーククラスが適用される', async ({ page }) => {
    await page.goto('/');

    // ダークモードに切替
    const themeBtn = page.getByRole('button', { name: /モードに切替/ });
    await themeBtn.click();

    const html = page.locator('html');
    const isDark = await html.evaluate((el) => el.classList.contains('dark'));

    if (!isDark) {
      // すでにダークだった場合はもう一度切替
      await themeBtn.click();
    }

    await expect(html).toHaveClass(/dark/);
  });

  test('ダークモード: 黒テキストが存在しないこと', async ({ page }) => {
    await page.goto('/');

    // ダークモードに切替
    const html = page.locator('html');
    const isDark = await html.evaluate((el) => el.classList.contains('dark'));
    if (!isDark) {
      await page.getByRole('button', { name: /モードに切替/ }).click();
    }
    await expect(html).toHaveClass(/dark/);

    // ダーク背景上のテキスト要素で黒(rgb(0,0,0)~rgb(30,30,30))がないことを確認
    const darkTextElements = await page.evaluate(() => {
      const problems: string[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      let node: Element | null;

      while ((node = walker.nextNode() as Element | null)) {
        const style = getComputedStyle(node);
        const color = style.color;
        const bg = style.backgroundColor;

        // 不可視要素はスキップ
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0')
          continue;
        // テキストがない要素はスキップ
        if (!node.textContent?.trim()) continue;
        // 子要素のテキストのみの場合はスキップ
        const ownText = Array.from(node.childNodes)
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent?.trim())
          .join('');
        if (!ownText) continue;

        // RGB パース
        const parseRgb = (c: string) => {
          const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          return m ? [+m[1], +m[2], +m[3]] : null;
        };

        const rgb = parseRgb(color);
        if (!rgb) continue;

        // 非常に暗いテキスト色 (r,g,b 全て < 40) を検出
        if (rgb[0] < 40 && rgb[1] < 40 && rgb[2] < 40) {
          const tag = node.tagName.toLowerCase();
          const cls = (node as HTMLElement).className?.toString().slice(0, 80) || '';
          const text = ownText.slice(0, 30);
          problems.push(`<${tag}> "${text}" color:${color} class:${cls}`);
        }
      }

      return problems;
    });

    // 黒テキスト要素が0件であること
    expect(
      darkTextElements,
      `ダークモードで黒テキスト検出:\n${darkTextElements.join('\n')}`,
    ).toHaveLength(0);
  });

  test('ダークモード: スクリーンショット', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const isDark = await html.evaluate((el) => el.classList.contains('dark'));
    if (!isDark) {
      await page.getByRole('button', { name: /モードに切替/ }).click();
    }
    await expect(html).toHaveClass(/dark/);

    await expect(page).toHaveScreenshot('dark-mode-main.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('ライトモード: スクリーンショット', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const isDark = await html.evaluate((el) => el.classList.contains('dark'));
    if (isDark) {
      await page.getByRole('button', { name: /モードに切替/ }).click();
    }
    await expect(html).not.toHaveClass(/dark/);

    await expect(page).toHaveScreenshot('light-mode-main.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
});
