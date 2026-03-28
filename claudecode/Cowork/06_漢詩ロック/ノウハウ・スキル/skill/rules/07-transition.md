# トランジション実装ルール

## フェードトランジション
```tsx
const TRANSITION_DURATION = 30; // 1秒（30fps）

// フェードアウト（シーン1の末尾）
const fadeOut = interpolate(
  frame,
  [durationScene1 - TRANSITION_DURATION, durationScene1],
  [1, 0],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);

// フェードイン（シーン2の冒頭）
const fadeIn = interpolate(
  frame,
  [0, TRANSITION_DURATION],
  [0, 1],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);
```

## スライドトランジション
```tsx
const slideX = interpolate(frame, [0, 30], [1920, 0], {
  easing: Easing.out(Easing.quad),
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
style={{ transform: `translateX(${slideX}px)` }}
```

## サークルワイプ（clip-path使用）
```tsx
const radius = interpolate(frame, [0, 30], [0, 200]);
style={{
  clipPath: `circle(${radius}% at 50% 50%)`,
}}
```

## Remotion公式のトランジション
```tsx
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={90}>
    <Scene1 />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 30 })}
  />
  <TransitionSeries.Sequence durationInFrames={90}>
    <Scene2 />
  </TransitionSeries.Sequence>
</TransitionSeries>
```
