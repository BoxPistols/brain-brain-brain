import type { Meta, StoryObj } from '@storybook/react-vite';
import { HeaderBar } from './HeaderBar';
import { fn } from 'storybook/test';

const seedScenarios = [
  { label: 'ITエンジニア採用', form: { productService: 'IT人材紹介', sessionType: 'ops' } },
  {
    label: 'ハイクラス転職',
    form: { productService: 'エグゼクティブ紹介', sessionType: 'growth' },
  },
];

const meta = {
  title: 'Layout/HeaderBar',
  component: HeaderBar,
  args: {
    seedScenarios,
    onSeed: fn(),
    onPreset: fn(),
    onToggleTheme: fn(),
    onShowHelp: fn(),
    onStartTour: fn(),
    onShowLogs: fn(),
    onToggleCfg: fn(),
    showCfg: false,
    activePreset: 'equal',
  },
} satisfies Meta<typeof HeaderBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Free mode: 残り回数表示 */
export const FreeMode: Story = {
  args: {
    proMode: false,
    modelLabel: 'Auto',
    connStatus: { status: 'idle', msg: '' },
    isDark: false,
    lastUsedModel: null,
    freeRemaining: { remaining: 45, limit: 50 },
  },
};

/** Pro mode: Pro バッジ */
export const ProMode: Story = {
  args: {
    proMode: true,
    modelLabel: 'Auto',
    connStatus: { status: 'ok', msg: '接続成功' },
    isDark: false,
    lastUsedModel: 'gpt-5-mini',
    freeRemaining: null,
  },
};

/** Auto → 5-nano 表示 */
export const WithAutoResolved: Story = {
  args: {
    proMode: true,
    modelLabel: 'Auto',
    connStatus: { status: 'ok', msg: '接続成功' },
    isDark: true,
    lastUsedModel: 'gpt-5-nano',
    freeRemaining: null,
  },
};
