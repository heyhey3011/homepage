# アニメーション実装ルール

## interpolate の正しい使い方
```tsx
import { interpolate } from 'remotion';

// 基本：frame 0〜30 の間で 0 から 1 に変化
const value = interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: 'clamp',   // 必須：範囲外をクランプ
  extrapolateRight: 'clamp',  // 必須：範囲外をクランプ
});
```

## spring の使い方（バネ・バウンス）
```tsx
import { spring } from 'remotion';

const scale = spring({
  frame,
  fps,
  config: {
    damping: 12,      // 減衰（大きいほど早く止まる）
    stiffness: 100,   // 硬さ（大きいほど速い）
    mass: 1,          // 質量（大きいほど重い）
  },
  durationInFrames: 30, // 省略可
});
```

## イージングの実装
```tsx
import { interpolate, Easing } from 'remotion';

// ease-out（減速）
const x = interpolate(frame, [0, 30], [0, 100], {
  easing: Easing.out(Easing.quad),
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});

// ease-in（加速）
const y = interpolate(frame, [0, 30], [0, 100], {
  easing: Easing.in(Easing.quad),
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```

## 一文字ずつのアニメーション
```tsx
const text = "こんにちは";
return (
  <div>
    {text.split('').map((char, i) => {
      const delay = i * 3; // 3フレームずつ遅らせる
      const charOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      return <span key={i} style={{ opacity: charOpacity }}>{char}</span>;
    })}
  </div>
);
```

## Sequence（シーケンス）で表示タイミングを制御
```tsx
import { Sequence } from 'remotion';

<Sequence from={0} durationInFrames={90}>
  <Scene1 />
</Sequence>
<Sequence from={90} durationInFrames={90}>
  <Scene2 />
</Sequence>
```
