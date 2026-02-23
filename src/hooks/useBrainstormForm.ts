import { useState, useMemo, useCallback } from 'react';
import { BrainstormForm, AIResults } from '../types';
import { nextSeed, getSeedByIndex, MOCK_SCENARIOS } from '../constants/mockData';
import { TYPES, getDeepDiveSuggestions } from '../constants/prompts';
import { autoN } from '../utils/formatters';
import { isProMode } from '../constants/models';

const initialFormState: BrainstormForm = {
  projectName: '',
  productService: '',
  teamGoals: '',
  sessionType: 'product',
  customSession: '',
  issues: [{ text: '', detail: '', sub: [] }],
  serviceUrl: '',
  competitors: [],
  kpis: [],
};

export const useBrainstormForm = () => {
  const [dep, setDep] = useState(2);
  const [form, setForm] = useState<BrainstormForm>(initialFormState);
  const [usedName, setUsedName] = useState('');

  const sesLabel = useMemo(() => 
    form.sessionType === 'other' ? (form.customSession || 'カスタム') : TYPES[form.sessionType],
    [form.sessionType, form.customSession]
  );
  
  const suggestions = useMemo(() =>
    getDeepDiveSuggestions(
      form.sessionType,
      form.productService,
      form.issues.map(x => x.text).filter(Boolean),
      (form.kpis || []).filter(k => k.label && k.value),
      (form.competitors || []).some(c => c.name || c.url),
    ),
    [form.sessionType, form.productService, form.issues, form.kpis, form.competitors]
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

  const applySeed = useCallback((index?: number) => {
    const s = index !== undefined ? getSeedByIndex(index) : nextSeed();
    const isPro = isProMode(localStorage.getItem('userApiKey') || '');

    setDep(isPro ? s.dep : Math.min(s.dep, 3));
    setForm(s.form);
    setUsedName(s.form.projectName || autoN(s.form.productService, s.form.teamGoals));

    return { modelId: s.modelId, results: s.results as AIResults };
  }, []);

  return {
    form,
    setForm,
    dep,
    setDep,
    usedName,
    setUsedName,
    sesLabel,
    suggestions,
    issueStr,
    getValidProjectName,
    applySeed,
    seedScenarios: MOCK_SCENARIOS,
  };
};
