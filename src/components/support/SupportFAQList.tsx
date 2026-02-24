import { useState } from 'react';
import { ChevronDown, Bot } from 'lucide-react';
import { T } from '../../constants/theme';
import type { FAQCategory } from './supportData';

interface Props {
  category: FAQCategory;
  onAskAI: () => void;
}

export const SupportFAQList: React.FC<Props> = ({ category, onAskAI }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {category.items.map((item, i) => (
        <div
          key={i}
          className={`rounded-lg border ${T.cardFlat.includes('border') ? '' : 'border-slate-200 dark:border-slate-700/60'} overflow-hidden`}
        >
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className={`w-full text-left px-3 py-2.5 text-sm font-medium ${T.t1} hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-2 cursor-pointer`}
          >
            <span>{item.q}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${T.t3} ${openIdx === i ? 'rotate-180' : ''}`}
            />
          </button>
          <div
            className="grid transition-all duration-200 ease-out"
            style={{ gridTemplateRows: openIdx === i ? '1fr' : '0fr' }}
          >
            <div className="overflow-hidden">
              <div className={`px-3 pb-3 text-xs leading-relaxed ${T.t2} whitespace-pre-line`}>
                {item.a}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* AI質問への誘導 */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-700/40">
        <button
          onClick={onAskAI}
          className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium ${T.accentTxt} hover:bg-brand-50 dark:hover:bg-brand-light/15 transition-colors cursor-pointer`}
        >
          <Bot className="w-3.5 h-3.5" />
          解決しない場合はAIに質問
        </button>
      </div>
    </div>
  );
};
