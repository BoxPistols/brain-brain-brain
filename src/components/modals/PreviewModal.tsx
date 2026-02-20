import React from 'react';
import { Download, FileText, Printer, X, Eye } from 'lucide-react';
import { RichText } from '../results/RichText';
import { dlFile } from '../../utils/report';
import { T } from '../../constants/theme';

interface PreviewProps {
  md: string;
  pn: string;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewProps> = ({ md, pn, onClose }) => {
  const txt = md.replace(/\*\*/g, '').replace(/#{1,3}\s/g, '■ ').replace(/\|/g, ' | ').replace(/---/g, '──────');
  
  const doPrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${pn}</title><style>body{font-family:-apple-system,'Hiragino Sans',sans-serif;max-width:780px;margin:32px auto;padding:0 20px;color:#1a1a1a;line-height:1.8;font-size:13px}pre{white-space:pre-wrap;font-family:inherit}@media print{body{margin:16px}}</style></head><body><pre>${txt}</pre></body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className={`${T.card} w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl`} onClick={e => e.stopPropagation()}>
        <div className={`flex items-center justify-between px-4 py-2.5 border-b ${T.div} shrink-0`}>
          <div className="flex items-center gap-2"><Eye className="w-4 h-4 text-blue-500" /><span className={`text-sm font-semibold ${T.t1}`}>プレビュー</span></div>
          <button onClick={onClose} className={`p-1 rounded-lg ${T.btnGhost}`}><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4"><RichText text={md} /></div>
        <div className={`flex items-center justify-end gap-2 px-4 py-2.5 border-t ${T.div} shrink-0`}>
          <button onClick={() => dlFile(md, `${pn}.md`, 'text/markdown')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${T.btnGhost}`}><Download className="w-3 h-3" />MD</button>
          <button onClick={() => dlFile(txt, `${pn}.txt`, 'text/plain')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${T.btnGhost}`}><FileText className="w-3 h-3" />TXT</button>
          <button onClick={doPrint} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${T.btnGhost}`}><Printer className="w-3 h-3" />PDF</button>
        </div>
      </div>
    </div>
  );
};
