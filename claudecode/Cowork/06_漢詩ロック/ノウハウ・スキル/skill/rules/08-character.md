# ゆっくりキャラクター実装ルール

## パーツ構成（public/ に配置）
```
public/
├── face.png        # 顔のベース
├── eye-open.png    # 目（開いた状態）
├── eye-half.png    # 目（半開き）
├── eye-close.png   # 目（閉じた状態）
├── mouth-close.png # 口（閉じた状態）
├── mouth-half.png  # 口（半開き）
└── mouth-open.png  # 口（開いた状態）
```

## 口パクアニメーション
```tsx
const MOUTH_CYCLE = 4; // 4フレームで1サイクル
const mouthPhase = frame % (MOUTH_CYCLE * 2);

const getMouthSrc = () => {
  if (mouthPhase < MOUTH_CYCLE) return staticFile('mouth-open.png');
  return staticFile('mouth-close.png');
};

<Img src={getMouthSrc()} style={{ position: 'absolute', ... }} />
```

## 瞬きアニメーション
```tsx
// 5秒（150フレーム）に1回、ランダム位置で瞬き
const BLINK_INTERVAL = 150;
const blinkOffset = 30; // ランダムオフセット（固定シード）
const blinkFrame = (frame + blinkOffset) % BLINK_INTERVAL;

const getEyeSrc = () => {
  if (blinkFrame < 3) return staticFile('eye-close.png');
  if (blinkFrame < 6) return staticFile('eye-half.png');
  return staticFile('eye-open.png');
};
```

## 呼吸アニメーション（Sin波）
```tsx
const breathY = Math.sin((frame / 30) * Math.PI * (2 / 3)) * 3;
// 3秒周期で上下3px

style={{ transform: `translateY(${breathY}px)` }}
```

## 統合コンポーネント例
```tsx
type CharacterProps = {
  x: number;
  y: number;
  scale: number;
  isTalking: boolean;
};

export const Character: React.FC<CharacterProps> = ({ x, y, scale, isTalking }) => {
  const frame = useCurrentFrame();

  // 呼吸
  const breathY = Math.sin((frame / 30) * Math.PI * (2 / 3)) * 3;

  // 瞬き
  const blinkFrame = frame % 150;
  const eyeSrc = blinkFrame < 3
    ? staticFile('eye-close.png')
    : blinkFrame < 6
    ? staticFile('eye-half.png')
    : staticFile('eye-open.png');

  // 口パク
  const mouthSrc = isTalking && frame % 8 < 4
    ? staticFile('mouth-open.png')
    : staticFile('mouth-close.png');

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y + breathY,
      transform: `scale(${scale})`,
    }}>
      <Img src={staticFile('face.png')} />
      <Img src={eyeSrc} style={{ position: 'absolute', top: 80, left: 60 }} />
      <Img src={mouthSrc} style={{ position: 'absolute', top: 160, left: 80 }} />
    </div>
  );
};
```
