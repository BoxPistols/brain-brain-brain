import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Easing,
} from 'remotion';

/* ─── スライドデータ ─── */

interface Slide {
  lines: string[];
  sub?: string;
  accent?: boolean;
}

const SLIDES: Slide[] = [
  // 1. 課題提起
  {
    lines: ['施策を増やしても、', '成果に結びつかない'],
    sub: '問題は施策の量ではなく、問いの立て方にある',
  },
  // 2. 課題の具体化
  {
    lines: ['見えにくい構造的課題、', '属人化した意思決定、', '後回しにされる本質議論'],
    sub: '多くの組織が直面している壁',
  },
  // 3. 視点の転換
  {
    lines: ['打ち手を考える前に、', '課題を正しく分解する'],
    sub: '筋の良い「問い」が、筋の良い戦略をつくる',
  },
  // 4. ツール紹介
  {
    lines: ['BrainBrainBrain'],
    sub: '事業課題を構造化し、打ち手の選択肢を広げる',
    accent: true,
  },
  // 5. 機能紹介
  {
    lines: ['課題を分析し、', '優先度つきの戦略アイデアを生成、', '深掘りで精度を高める'],
    sub: '考える過程そのものを支援するツール',
  },
  // 6. 行動喚起
  {
    lines: ['まずは試してみましょう'],
    sub: 'サンプルデータですぐに体験できます',
    accent: true,
  },
];

const SLIDE_DURATION = 120; // 4秒/スライド @30fps
const TRANSITION = 30; // フェード遷移 1秒

export const WELCOME_DURATION = SLIDES.length * SLIDE_DURATION; // 720 frames = 24秒

/* ─── メインコンポジション ─── */

export const WelcomeComposition: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", "Meiryo", sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* 背景アクセント */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }}
      />
      {SLIDES.map((slide, i) => (
        <Sequence key={i} from={i * SLIDE_DURATION} durationInFrames={SLIDE_DURATION}>
          <SlideView slide={slide} fps={fps} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/* ─── 各スライド ─── */

const SlideView: React.FC<{ slide: Slide; fps: number }> = ({ slide, fps }) => {
  const frame = useCurrentFrame();

  // スライド全体のフェードイン/アウト
  const opacity = interpolate(
    frame,
    [0, TRANSITION, SLIDE_DURATION - TRANSITION, SLIDE_DURATION],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // 全体のスライドアップ
  const translateY = interpolate(frame, [0, TRANSITION], [24, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: `translateY(${translateY}px)`,
        padding: '40px 60px',
      }}
    >
      {/* メインテキスト */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        {slide.lines.map((line, li) => {
          const lineSpring = spring({
            frame: frame - li * 8,
            fps,
            config: { damping: 20, stiffness: 80 },
          });
          const lineOpacity = interpolate(lineSpring, [0, 1], [0, 1]);
          const lineY = interpolate(lineSpring, [0, 1], [18, 0]);
          return (
            <div
              key={li}
              style={{
                opacity: lineOpacity,
                transform: `translateY(${lineY}px)`,
                fontSize: slide.accent ? 38 : 32,
                fontWeight: slide.accent ? 700 : 600,
                color: slide.accent ? '#60a5fa' : '#f1f5f9',
                textAlign: 'center',
                lineHeight: 1.5,
                letterSpacing: '0.02em',
              }}
            >
              {line}
            </div>
          );
        })}
      </div>

      {/* サブテキスト */}
      {slide.sub && (
        <div
          style={{
            marginTop: 24,
            opacity: interpolate(frame, [TRANSITION + 10, TRANSITION + 30], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            fontSize: 17,
            color: '#94a3b8',
            textAlign: 'center',
            lineHeight: 1.6,
            maxWidth: 480,
          }}
        >
          {slide.sub}
        </div>
      )}
    </AbsoluteFill>
  );
};
