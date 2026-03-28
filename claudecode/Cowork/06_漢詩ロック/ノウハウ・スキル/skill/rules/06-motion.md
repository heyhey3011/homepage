# モーショングラフィックス実装ルール

## 基本の4要素

### 1. 位置（Position）
```tsx
const x = interpolate(frame, [0, 30], [-200, 0], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
style={{ transform: `translateX(${x}px)` }}
```

### 2. 大きさ（Scale）
```tsx
const scale = spring({ frame, fps, config: { damping: 12 } });
style={{ transform: `scale(${scale})` }}
```

### 3. 回転（Rotation）
```tsx
const rotate = interpolate(frame, [0, fps], [0, 360]);
style={{ transform: `rotate(${rotate}deg)` }}
```

### 4. 透明度（Opacity）
```tsx
const opacity = interpolate(frame, [0, 20], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
style={{ opacity }}
```

## 複数の変換を組み合わせる
```tsx
style={{
  transform: `translateX(${x}px) scale(${scale}) rotate(${rotate}deg)`,
  opacity,
}}
```

## SVG図形の描画
```tsx
// 円
<svg width={300} height={300}>
  <circle cx={150} cy={150} r={100} fill="red" />
</svg>

// 四角形
<svg width={200} height={200}>
  <rect x={10} y={10} width={180} height={180} fill="blue" />
</svg>
```

## イージング早見表
| 効果 | コード |
|------|--------|
| 減速（自然な着地） | `Easing.out(Easing.quad)` |
| 加速（飛び出し） | `Easing.in(Easing.quad)` |
| 加速→減速 | `Easing.inOut(Easing.quad)` |
| バウンス | `spring({ config: { damping: 6 } })` |
| 弾性 | `spring({ config: { damping: 4, stiffness: 200 } })` |
