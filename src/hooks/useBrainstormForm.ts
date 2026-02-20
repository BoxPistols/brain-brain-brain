import { useState, useMemo, useCallback } from 'react';
import { BrainstormForm } from '../types';
import { nextSeed } from '../constants/mockData';
import { TYPES, SUGGEST } from '../constants/prompts';
import { autoN } from '../utils/formatters';

const initialFormState: BrainstormForm = {
  projectName: '',
  productService: '',
  teamGoals: '',
  sessionType: 'product',
  customSession: '',
  tlMode: 'period',
  tlStart: '',
  tlEnd: '',
  tlDead: '',
  issues: [{ text: '', detail: '', sub: [] }]
};

export const useBrainstormForm = () => {
  const [dep, setDep] = useState(2);
  const [form, setForm] = useState<BrainstormForm>(initialFormState);
  const [usedName, setUsedName] = useState('');

  const sesLabel = useMemo(() => 
    form.sessionType === 'other' ? (form.customSession || 'カスタム') : TYPES[form.sessionType],
    [form.sessionType, form.customSession]
  );
  
  const tlStr = useMemo(() => 
    form.tlMode === 'period' ? `${form.tlStart || '?'} 〜 ${form.tlEnd || '?'}` : (form.tlDead || '未指定'),
    [form.tlMode, form.tlStart, form.tlEnd, form.tlDead]
  );
  
  const suggestions = useMemo(() => 
    SUGGEST[form.sessionType] || SUGGEST.other,
    [form.sessionType]
  );
  
  const issueStr = useMemo(() => 
    form.issues
      .filter(x => x.text.trim())
      .map(x => {
        let s = x.text;
        if (x.detail) s += `（${x.detail}）`;
        if (x.sub?.filter(Boolean).length) s += ': ' + x.sub.filter(Boolean).join(', ');
        return s;
      })
      .join(' / '),
    [form.issues]
  );

  const getValidProjectName = useCallback(() => {
    return form.projectName.trim() || autoN(form.productService, form.teamGoals);
  }, [form.projectName, form.productService, form.teamGoals]);

  const [seedModelId, setSeedModelId] = useState<string | null>(null);
  const [seedResults, setSeedResults] = useState<any | null>(null);

  const applySeed = useCallback(() => {
    const s = nextSeed();
    setSeedModelId(s.modelId);
    setDep(s.dep);
    setForm(s.form);
    setSeedResults(s.results);
    setUsedName(s.form.projectName || autoN(s.form.productService, s.form.teamGoals));
    
    return { modelId: s.modelId, results: s.results };
  }, []);

  return {
    form,
    setForm,
    dep,
    setDep,
    usedName,
    setUsedName,
    sesLabel,
    tlStr,
    suggestions,
    issueStr,
    getValidProjectName,
    applySeed,
    seedModelId,
    setSeedModelId,
    seedResults,
    setSeedResults
  };
};
