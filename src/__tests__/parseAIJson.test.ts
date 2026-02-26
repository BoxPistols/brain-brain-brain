import { describe, it, expect } from 'vitest';
import { parseAIJson, extractMarkdown } from '../utils/parseAIJson';

describe('parseAIJson', () => {
  it('正常なJSONをパースできる', () => {
    const input = JSON.stringify({
      understanding: 'テスト分析',
      ideas: [
        {
          title: 'アイデア1',
          description: '詳細1',
          priority: 'High',
          effort: 'Low',
          impact: 'High',
        },
      ],
      suggestions: ['質問1', '質問2'],
    });
    const result = parseAIJson(input);
    expect(result.understanding).toBe('テスト分析');
    expect(result.ideas).toHaveLength(1);
    expect(result.ideas[0].title).toBe('アイデア1');
    expect(result.suggestions).toEqual(['質問1', '質問2']);
  });

  it('コードフェンス付きJSONを処理できる', () => {
    const input = '```json\n{"understanding":"分析","ideas":[]}\n```';
    const result = parseAIJson(input);
    expect(result.understanding).toBe('分析');
    expect(result.ideas).toEqual([]);
  });

  it('前後にテキストがあるJSONを抽出できる', () => {
    const input =
      'Here is the result:\n{"understanding":"OK","ideas":[{"title":"T","description":"D","priority":"High","effort":"Low","impact":"Medium"}]}\nEnd.';
    const result = parseAIJson(input);
    expect(result.understanding).toBe('OK');
    expect(result.ideas[0].title).toBe('T');
  });

  it('末尾が切れたJSONを修復できる', () => {
    const input =
      '{"understanding":"分析結果","ideas":[{"title":"A","description":"B","priority":"High","effort":"Low","impact":"High"},{"title":"C","description":"D","priority":"Medium","effort":"Medium","impact":"Med';
    const result = parseAIJson(input);
    expect(result.understanding).toBe('分析結果');
    expect(result.ideas.length).toBeGreaterThanOrEqual(1);
    expect(result.ideas[0].title).toBe('A');
  });

  it('JSONが全く見つからない場合はエラー', () => {
    expect(() => parseAIJson('これはテキストです')).toThrow('AIの回答を処理できませんでした');
  });

  it('空文字列はエラー', () => {
    expect(() => parseAIJson('')).toThrow('AIの回答を処理できませんでした');
  });

  it('keyIssue/funnelStageがあれば保持される', () => {
    const input = JSON.stringify({
      understanding: '分析',
      ideas: [],
      keyIssue: '最重要課題',
      funnelStage: 'スカウト',
    });
    const result = parseAIJson(input);
    expect(result.keyIssue).toBe('最重要課題');
    expect(result.funnelStage).toBe('スカウト');
  });

  it('ideas内の不正なpriorityはMediumに補完される', () => {
    const input = JSON.stringify({
      understanding: 'OK',
      ideas: [{ title: 'T', description: 'D', priority: 'INVALID', effort: 'Low', impact: 'High' }],
    });
    const result = parseAIJson(input);
    expect(result.ideas[0].priority).toBe('Medium');
    expect(result.ideas[0].effort).toBe('Low');
  });

  it('understandingが欠落していても空文字で補完される', () => {
    const input = JSON.stringify({ ideas: [] });
    const result = parseAIJson(input);
    expect(result.understanding).toBe('');
  });

  it('suggestionsに非文字列が混入しても除外される', () => {
    const input = JSON.stringify({
      understanding: 'OK',
      ideas: [],
      suggestions: ['有効な質問', 123, null, '別の質問'],
    });
    const result = parseAIJson(input);
    expect(result.suggestions).toEqual(['有効な質問', '別の質問']);
  });

  it('feasibilityスコアが正常にパースされる', () => {
    const input = JSON.stringify({
      understanding: 'OK',
      ideas: [
        {
          title: 'T',
          description: 'D',
          priority: 'High',
          effort: 'Low',
          impact: 'High',
          feasibility: { total: 75, resource: 80, techDifficulty: 60, orgAcceptance: 85 },
        },
      ],
    });
    const result = parseAIJson(input);
    expect(result.ideas[0].feasibility).toEqual({
      total: 75,
      resource: 80,
      techDifficulty: 60,
      orgAcceptance: 85,
    });
  });

  it('feasibilityが欠落している場合はundefined', () => {
    const input = JSON.stringify({
      understanding: 'OK',
      ideas: [{ title: 'T', description: 'D', priority: 'High', effort: 'Low', impact: 'High' }],
    });
    const result = parseAIJson(input);
    expect(result.ideas[0].feasibility).toBeUndefined();
  });

  it('feasibilityの不正値は0-100にクランプされる', () => {
    const input = JSON.stringify({
      understanding: 'OK',
      ideas: [
        {
          title: 'T',
          description: 'D',
          priority: 'High',
          effort: 'Low',
          impact: 'High',
          feasibility: { total: 150, resource: -20, techDifficulty: 'abc', orgAcceptance: 50.7 },
        },
      ],
    });
    const result = parseAIJson(input);
    const f = result.ideas[0].feasibility!;
    expect(f.total).toBe(100);
    expect(f.resource).toBe(0);
    expect(f.techDifficulty).toBe(50); // NaN → default 50
    expect(f.orgAcceptance).toBe(51); // rounded
  });
});

describe('extractMarkdown', () => {
  it('純粋なMarkdownテキストはそのまま返す', () => {
    const md = '# 見出し\n\n本文テキスト\n\n- 箇条書き';
    expect(extractMarkdown(md)).toBe(md);
  });

  it('JSON wrapper {"markdown": "..."} からテキストを抽出する', () => {
    const input = JSON.stringify({ markdown: '# 見出し\n\n本文' });
    expect(extractMarkdown(input)).toBe('# 見出し\n\n本文');
  });

  it('JSON wrapper {"content": "..."} からテキストを抽出する', () => {
    const input = JSON.stringify({ content: '回答テキスト' });
    expect(extractMarkdown(input)).toBe('回答テキスト');
  });

  it('JSON wrapper {"answer": "..."} からテキストを抽出する', () => {
    const input = JSON.stringify({ answer: '回答テキスト' });
    expect(extractMarkdown(input)).toBe('回答テキスト');
  });

  it('JSON wrapper {"text": "..."} からテキストを抽出する', () => {
    const input = JSON.stringify({ text: 'テキスト内容' });
    expect(extractMarkdown(input)).toBe('テキスト内容');
  });

  it('リテラル \\n を実改行に変換する', () => {
    const input = '# 見出し\\n\\n本文\\n- リスト';
    expect(extractMarkdown(input)).toBe('# 見出し\n\n本文\n- リスト');
  });

  it('JSON wrapper + リテラル \\n の複合パターン', () => {
    // AI が {"markdown": "# 見出し\n本文"} を返すがJSON.parseで\nは復元される
    const input = '{"markdown": "# 見出し\\n本文テキスト"}';
    const result = extractMarkdown(input);
    expect(result).toBe('# 見出し\n本文テキスト');
  });

  it('コードフェンス付きJSON wrapper を処理する', () => {
    const input = '```json\n{"markdown": "# タイトル\\n内容"}\n```';
    expect(extractMarkdown(input)).toBe('# タイトル\n内容');
  });

  it('コードフェンス付きMarkdownを処理する', () => {
    const input = '```markdown\n# 見出し\n\n本文\n```';
    expect(extractMarkdown(input)).toBe('# 見出し\n\n本文');
  });

  it('不正なJSONはそのままテキストとして返す', () => {
    const input = '{ これは不正なJSON }';
    expect(extractMarkdown(input)).toBe('{ これは不正なJSON }');
  });

  it('空文字は空文字を返す', () => {
    expect(extractMarkdown('')).toBe('');
  });

  it('markdownキーがない通常のJSONオブジェクトはそのまま返す', () => {
    const input = '{"foo": "bar", "baz": 123}';
    expect(extractMarkdown(input)).toBe(input);
  });
});
