import { describe, it, expect } from 'vitest';
import { parseAIJson } from '../utils/parseAIJson';

describe('parseAIJson', () => {
  it('正常なJSONをパースできる', () => {
    const input = JSON.stringify({
      understanding: 'テスト分析',
      ideas: [
        { title: 'アイデア1', description: '詳細1', priority: 'High', effort: 'Low', impact: 'High' },
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
    const input = 'Here is the result:\n{"understanding":"OK","ideas":[{"title":"T","description":"D","priority":"High","effort":"Low","impact":"Medium"}]}\nEnd.';
    const result = parseAIJson(input);
    expect(result.understanding).toBe('OK');
    expect(result.ideas[0].title).toBe('T');
  });

  it('末尾が切れたJSONを修復できる', () => {
    const input = '{"understanding":"分析結果","ideas":[{"title":"A","description":"B","priority":"High","effort":"Low","impact":"High"},{"title":"C","description":"D","priority":"Medium","effort":"Medium","impact":"Med';
    const result = parseAIJson(input);
    expect(result.understanding).toBe('分析結果');
    expect(result.ideas.length).toBeGreaterThanOrEqual(1);
    expect(result.ideas[0].title).toBe('A');
  });

  it('JSONが全く見つからない場合はエラー', () => {
    expect(() => parseAIJson('これはテキストです')).toThrow('No JSON object found');
  });

  it('空文字列はエラー', () => {
    expect(() => parseAIJson('')).toThrow('No JSON object found');
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
});
