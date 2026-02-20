import React from 'react';
import { ExternalLink } from 'lucide-react';

interface RichTextProps {
  text: string | undefined;
}

export const RichText: React.FC<RichTextProps> = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0, tableRows: string[] = [], inTable = false;

  const ri = (str: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const rx = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[([^\]]+)\]\((https?:\/\/[^\)]+)\))|(https?:\/\/[^\s<\]）]+)/g;
    let last = 0, m;
    while ((m = rx.exec(str)) !== null) {
      if (m.index > last) parts.push(str.slice(last, m.index));
      if (m[1]) parts.push(<strong key={m.index} className="font-semibold text-slate-800 dark:text-slate-200">{m[2]}</strong>);
      else if (m[3]) parts.push(<em key={m.index} className="italic text-slate-600 dark:text-slate-400">{m[4]}</em>);
      else if (m[5]) parts.push(<code key={m.index} className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-blue-600 dark:text-blue-300 text-xs font-mono">{m[6]}</code>);
      else if (m[7]) parts.push(<a key={m.index} href={m[9]} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5">{m[8]}<ExternalLink className="w-2.5 h-2.5" /></a>);
      else if (m[10]) parts.push(<a key={m.index} href={m[10]} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 break-all">{m[10].length > 60 ? m[10].slice(0, 57) + '…' : m[10]}<ExternalLink className="w-2.5 h-2.5" /></a>);
      last = m.index + m[0].length;
    }
    if (last < str.length) parts.push(str.slice(last));
    return parts.length ? parts : str;
  };

  const flushTable = () => {
    if (!tableRows.length) return;
    const hdr = tableRows[0], body = tableRows.slice(2);
    elements.push(
      <div key={`tbl-${i}`} className="overflow-x-auto my-2">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              {hdr.split('|').filter(Boolean).map((c, ci) => (
                <th key={ci} className="px-2 py-1.5 text-left bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-semibold">{c.trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri2) => (
              <tr key={ri2} className="even:bg-slate-50 dark:even:bg-slate-800/20">
                {row.split('|').filter(Boolean).map((c, ci) => (
                  <td key={ci} className="px-2 py-1 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400">{ri(c.trim())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
  };

  while (i < lines.length) {
    const ln = lines[i];
    const isT = ln.trim().startsWith('|') && ln.trim().endsWith('|');
    if (isT) { inTable = true; tableRows.push(ln.trim()); i++; continue; }
    if (inTable) { flushTable(); inTable = false; }
    if (ln.startsWith('### ')) elements.push(<h4 key={i} className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-3 mb-1">{ri(ln.slice(4))}</h4>);
    else if (ln.startsWith('## ')) elements.push(<h3 key={i} className="text-base font-bold text-slate-900 dark:text-slate-100 mt-4 mb-1.5 border-b border-slate-200 dark:border-slate-700/60 pb-1">{ri(ln.slice(3))}</h3>);
    else if (ln.startsWith('# ')) elements.push(<h2 key={i} className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2">{ri(ln.slice(2))}</h2>);
    else if (ln.startsWith('---')) elements.push(<hr key={i} className="border-slate-200 dark:border-slate-700/60 my-3" />);
    else if (ln.match(/^[-*]\s/)) elements.push(<div key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed ml-2"><span className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5">•</span><span>{ri(ln.replace(/^[-*]\s/, ''))}</span></div>);
    else if (ln.match(/^\d+\.\s/)) elements.push(<div key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed ml-2"><span className="text-slate-400 dark:text-slate-500 shrink-0 font-medium">{ln.match(/^(\d+)\./)?.[1] || ''}.</span><span>{ri(ln.replace(/^\d+\.\s/, ''))}</span></div>);
    else if (ln.trim() === '') elements.push(<div key={i} className="h-1.5" />);
    else elements.push(<p key={i} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{ri(ln)}</p>);
    i++;
  }
  if (inTable) flushTable();
  return <div className="space-y-0.5">{elements}</div>;
};
