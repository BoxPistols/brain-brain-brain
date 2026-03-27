import type { Meta, StoryObj } from '@storybook/react-vite';
import { PurposeCards } from './PurposeCards';
import { fn } from 'storybook/test';
import { PURPOSE_CLUSTERS } from '../../constants/prompts';

const meta = {
  title: 'Form/PurposeCards',
  component: PurposeCards,
  args: {
    clusters: PURPOSE_CLUSTERS,
    onSelect: fn(),
    mode: 'strategy',
  },
} satisfies Meta<typeof PurposeCards>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 未選択状態 */
export const Default: Story = {
  args: { selectedId: null, mode: 'strategy' },
};

/** 選択状態（active） */
export const Selected: Story = {
  args: { selectedId: 'close-deals', mode: 'strategy' },
};

/** プレイヤーモード */
export const PlayerMode: Story = {
  args: { selectedId: null, mode: 'player' },
};

/** デザイナーモード */
export const DesignerMode: Story = {
  args: { selectedId: null, mode: 'designer' },
};
