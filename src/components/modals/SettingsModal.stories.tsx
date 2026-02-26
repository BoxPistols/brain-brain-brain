import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsModal } from './SettingsModal';
import { fn } from 'storybook/test';

const meta = {
  title: 'Modals/SettingsModal',
  component: SettingsModal,
  args: {
    setModelId: fn(),
    setConnStatus: fn(),
    runConnTest: fn(),
    setApiKey: fn(),
    provider: 'openai',
    setProvider: fn(),
    localEndpoint: '',
    setLocalEndpoint: fn(),
    localModels: [],
    onFetchLocalModels: fn(),
    localModelId: '',
    setLocalModelId: fn(),
    fetchingModels: false,
  },
} satisfies Meta<typeof SettingsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** APIキーなし、Autoモデル、残り回数表示 */
export const FreeMode: Story = {
  args: {
    modelId: 'auto',
    connStatus: { status: 'idle', msg: '' },
    apiKey: '',
    sessionCost: 0,
    lastUsedModel: null,
    freeRemaining: { remaining: 48, limit: 50 },
  },
};

/** APIキーあり、コスト表示 */
export const ProMode: Story = {
  args: {
    modelId: 'auto',
    connStatus: { status: 'ok', msg: '接続成功' },
    apiKey: 'sk-test-key-1234',
    sessionCost: 2.45,
    lastUsedModel: 'gpt-5-nano',
    freeRemaining: null,
  },
};

/** Free mode 残り少ない */
export const WithRateLimit: Story = {
  args: {
    modelId: 'auto',
    connStatus: { status: 'idle', msg: '' },
    apiKey: '',
    sessionCost: 0,
    lastUsedModel: 'gpt-5-nano',
    freeRemaining: { remaining: 3, limit: 50, resetAt: Date.now() + 3600_000 },
  },
};
