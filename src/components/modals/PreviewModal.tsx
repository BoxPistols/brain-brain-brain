import React, { useState, useMemo } from 'react';
import { Download, FileText, Printer, X, Eye, ArrowLeft, Code } from 'lucide-react';
import { RichText } from '../results/RichText';
import { dlFile } from '../../utils/report';
import { T } from '../../constants/theme';

interface PreviewProps {
  md: string;
  pn: string;
  onClose: () => void;
}

type ViewMode = 'preview' | 'source';

export const PreviewModal: React.FC<PreviewProps> = ({ md, pn, onClose }) => {
  const [exportType, setExportType] = useState<'md' | 'txt' | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('preview');

  const txt = useMemo(() => {
    return md
      .replace(/^# (.*$)/gm, '$1')
      .replace(/^## (.*$)/gm, '■ $1')
      .replace(/^### (.*$)/gm, '  $1')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/^- (.*$)/gm, '・$1')
      .replace(/\|/g, ' ')
      .replace(/[-]{3,}/g, '────────────────────')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }, [md]);

  const content = exportType === 'md' ? md : txt;

  const doPrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${pn}</title><style>body{font-family:-apple-system,'Hiragino Sans',sans-serif;max-width:780px;margin:32px auto;padding:0 20px;color:#1a1a1a;line-height:1.8;font-size:13px}pre{white-space:pre-wrap;font-family:inherit}@media print{body{margin:16px}}</style></head><body><pre>${txt}</pre></body></html>`,
    );
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="レポートプレビュー"
    >
      <div
        className={`${T.card} w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${T.div} shrink-0`}>
          <div className="flex items-center gap-2">
            {exportType ? (
              <button
                onClick={() => {
                  setExportType(null);
                  setViewMode('preview');
                }}
                className={`flex items-center gap-1.5 text-xs ${T.t3} hover:text-slate-600 dark:hover:text-slate-300 transition-colors`}
              >
                <ArrowLeft className="w-4 h-4" />
                戻る
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand" />
                <span className={`text-sm font-bold ${T.t1}`}>レポートの確認</span>
              </div>
            )}
            {exportType && (
              <div className="flex items-center gap-2 ml-2">
                <span className={`text-sm font-bold ${T.t1}`}>
                  {exportType.toUpperCase()} で保存
                </span>
              </div>
            )}
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${T.btnGhost} transition-colors`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub Header for View Switching */}
        {exportType && (
          <div
            className={`px-4 py-2 border-b ${T.div} flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50`}
          >
            <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all ${
                  viewMode === 'preview'
                    ? 'bg-white dark:bg-slate-700 text-brand dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3 h-3" />
                  プレビュー
                </div>
              </button>
              <button
                onClick={() => setViewMode('source')}
                className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all ${
                  viewMode === 'source'
                    ? 'bg-white dark:bg-slate-700 text-brand dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Code className="w-3 h-3" />
                  ソース
                </div>
              </button>
            </div>
            <p className={`text-[10px] ${T.t3} italic`}>
              {exportType === 'md' ? 'Markdown形式' : 'フラットテキスト形式'}で書き出します
            </p>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {exportType && viewMode === 'source' ? (
            <textarea
              readOnly
              value={content}
              className={`w-full h-full min-h-[400px] text-xs font-mono rounded-xl p-4 resize-none ${T.inp} leading-relaxed focus:ring-0 border-none bg-slate-50/30 dark:bg-black/20`}
            />
          ) : exportType && viewMode === 'preview' && exportType === 'txt' ? (
            <div
              className={`whitespace-pre-wrap font-mono text-xs leading-relaxed p-4 rounded-xl ${T.inp} bg-slate-50/30 dark:bg-black/20 h-full`}
            >
              {txt}
            </div>
          ) : (
            <div className="max-w-none">
              <RichText text={md} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-end gap-3 px-4 py-3 border-t ${T.div} shrink-0 bg-slate-50/30 dark:bg-slate-900/30`}
        >
          {exportType ? (
            <>
              <button
                onClick={() => {
                  setExportType(null);
                  setViewMode('preview');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold ${T.btnGhost}`}
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
                  const filename = exportType === 'md' ? `${pn}_${ts}.md` : `${pn}_${ts}.txt`;
                  const mime = exportType === 'md' ? 'text/markdown' : 'text/plain';
                  dlFile(content, filename, mime);
                  setExportType(null);
                }}
                className="flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold bg-brand hover:bg-brand text-white shadow-lg shadow-brand/20 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                {exportType.toUpperCase()}をダウンロード
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setExportType('md');
                  setViewMode('preview');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 ${T.t1} transition-all active:scale-95`}
              >
                <FileText className="w-3.5 h-3.5 text-brand" />
                Markdown
              </button>
              <button
                onClick={() => {
                  setExportType('txt');
                  setViewMode('source');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 ${T.t1} transition-all active:scale-95`}
              >
                <FileText className="w-3.5 h-3.5 text-green-500" />
                テキスト
              </button>
              <div className={`w-px h-4 mx-1 ${T.div}`}></div>
              <button
                onClick={doPrint}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 ${T.t1} transition-all active:scale-95`}
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                PDF / 印刷
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
