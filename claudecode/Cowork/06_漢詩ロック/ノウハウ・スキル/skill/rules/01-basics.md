# Remotion 基本原則

## ✅ Remotionの基本
- RemotionはReactベースの動画生成ツール
- コードをフレームごとに静止画として書き出す
- `useCurrentFrame()` でフレーム番号を取得
- `useVideoConfig()` で動画の設定（fps・width・height・durationInFrames）を取得

## ❌ 絶対に使ってはいけないもの
- CSSアニメーション（`@keyframes`、`animation:`）
- Tailwindのアニメーション（`animate-bounce`、`animate-spin`など）
- `setTimeout` / `setInterval`
- `requestAnimationFrame`
- ブラウザ固有のAPI（`window.scroll`など）

## ✅ 代わりに使うもの
```tsx
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

const frame = useCurrentFrame();
const { fps, durationInFrames } = useVideoConfig();

// interpolate: 値を線形補間
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});

// spring: バネのような自然な動き
const scale = spring({ frame, fps, config: { damping: 12 } });
```

## フレーム計算の基本
- 30fps動画の場合：1秒 = 30フレーム
- 5秒の動画：durationInFrames = 150
- 開始2秒目：frame = 60
