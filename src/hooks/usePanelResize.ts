import { useState, useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'panelRatio';
const MIN = 20;
const MAX = 80;
const DEFAULT = 40;

export const PRESETS = {
  leftFocus:  70,
  equal:      50,
  rightFocus: 30,
} as const;

export function usePanelResize() {
  const [ratio, setRatio] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Math.max(MIN, Math.min(MAX, Number(saved))) : DEFAULT;
  });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const applyRatio = useCallback((r: number) => {
    const clamped = Math.max(MIN, Math.min(MAX, Math.round(r)));
    setRatio(clamped);
    localStorage.setItem(STORAGE_KEY, String(clamped));
  }, []);

  const calcRatio = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    applyRatio(((clientX - rect.left) / rect.width) * 100);
  }, [applyRatio]);

  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const startTouchDrag = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => calcRatio(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) calcRatio(e.touches[0].clientX);
    };
    const onEnd = () => setIsDragging(false);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onEnd);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onEnd);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, calcRatio]);

  const activePreset = Object.entries(PRESETS).find(
    ([, v]) => Math.abs(ratio - v) <= 3
  )?.[0] as keyof typeof PRESETS | undefined;

  return { ratio, applyRatio, startDrag, startTouchDrag, isDragging, containerRef, activePreset };
}
