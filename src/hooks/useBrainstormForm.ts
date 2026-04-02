import { useState, useMemo, useCallback } from 'react';
import { BrainstormForm, BrainstormMode, AIResults, SessionType } from '../types';
import { nextSeed, getSeedByIndex, MOCK_SCENARIOS } from '../constants/mockData';
import { TYPES, getDeepDiveSuggestions, PURPOSE_CLUSTERS } from '../constants/prompts';
import { autoN } from '../utils/formatters';
import { isProMode } from '../constants/models';

/** モード別のデフォルト sessionType */
const MODE_DEFAULT_SESSION: Record<BrainstormMode, SessionType> = {
  strategy: 'product',
  player: 'dev-org',
  designer: 'ux-research',
};

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
  const [mode, setModeState] = useState<BrainstormMode>(() => {
    try {
      const saved = localStorage.getItem('ai-brainstorm-mode') as BrainstormMode;
      if (saved && ['strategy', 'player', 'designer'].includes(saved)) return saved;
    } catch {
      /* ignore */
    }
    return 'strategy';
  });

  const setMode = useCallback((next: BrainstormMode) => {
    setModeState(next);
    localStorage.setItem('ai-brainstorm-mode', next);
    // モード切替時: デフォルト sessionType にリセット、フォーム一部クリア
    setForm((prev) => ({
      ...prev,
      sessionType: MODE_DEFAULT_SESSION[next] as SessionType,
      teamGoals: '',
      issues: [{ text: '', detail: '', sub: [] }],
    }));
  }, []);

  /** モードに応じたセッション種別だけ返す（ドロップダウン用） */
  const modeSessionTypes = useMemo(() => {
    const modeTypes = new Set<string>(
      PURPOSE_CLUSTERS.filter((c) => c.mode === mode).map((c) => c.sessionType as string),
    );
    // other は常に含める
    modeTypes.add('other');
    return Object.fromEntries(Object.entries(TYPES).filter(([k]) => modeTypes.has(k))) as Record<
      string,
      string
    >;
  }, [mode]);

  const sesLabel = useMemo(
    () =>
      form.sessionType === 'other' ? form.customSession || 'カスタム' : TYPES[form.sessionType],
    [form.sessionType, form.customSession],
  );

  const suggestions = useMemo(
    () =>
      getDeepDiveSuggestions(
        form.sessionType,
        form.productService,
        form.issues.map((x) => x.text).filter(Boolean),
        (form.kpis || []).filter((k) => k.label && k.value),
        (form.competitors || []).some((c) => c.name || c.url),
      ),
    [form.sessionType, form.productService, form.issues, form.kpis, form.competitors],
  );

  const issueStr = useMemo(
    () =>
      form.issues
        .filter((x) => x.text.trim())
        .map((x) => {
          let s = x.text;
          if (x.detail) s += `（${x.detail}）`;
          if (x.sub?.filter(Boolean).length) s += ': ' + x.sub.filter(Boolean).join(', ');
          return s;
        })
        .join(' / '),
    [form.issues],
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
    mode,
    setMode,
    modeSessionTypes,
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
