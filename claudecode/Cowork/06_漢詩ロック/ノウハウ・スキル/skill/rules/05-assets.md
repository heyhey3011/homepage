# 素材（アセット）活用ルール

## publicフォルダへの配置
- すべての素材（画像・音声・動画）は `public/` フォルダに入れる
- Remotionからは `/ファイル名` でアクセス可能

## 画像の表示
```tsx
import { Img, staticFile } from 'remotion';

<Img src={staticFile('logo.png')} style={{ width: 200, height: 'auto' }} />
```

## 音声の再生
```tsx
import { Audio, staticFile } from 'remotion';

// BGM（ループ）
<Audio src={staticFile('bgm.mp3')} volume={0.3} loop />

// 効果音（特定フレームで再生）
<Sequence from={60}>
  <Audio src={staticFile('click-sound.wav')} />
</Sequence>
```

## 動画素材の表示
```tsx
import { Video, staticFile } from 'remotion';

// 背景動画（ループ）
<Video src={staticFile('background.mp4')} loop style={{
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
}} />
```

## オフスクリーンレンダリングの注意
- `preloadAudio()` / `preloadVideo()` を使って事前ロードを推奨
- 大きなファイルはレンダリングが遅くなる場合がある
