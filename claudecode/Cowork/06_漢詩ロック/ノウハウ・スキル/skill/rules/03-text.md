# テキスト実装ルール

## 基本的なテキスト表示
```tsx
<div style={{
  fontFamily: 'sans-serif',
  fontSize: 48,
  color: 'white',
  fontWeight: 'bold',
  textAlign: 'center',
}}>
  テキスト内容
</div>
```

## Google Fonts の使い方
```tsx
import { loadFont } from '@remotion/google-fonts/PottaOne';

const { fontFamily } = loadFont();

// コンポーネント内で使用
<div style={{ fontFamily }}>テキスト</div>
```

## テキスト装飾

### 縁取り（ストローク）
```tsx
style={{
  WebkitTextStroke: '2px white',  // 縁取り
}}
```

### 影（ドロップシャドウ）
```tsx
style={{
  textShadow: '2px 4px 8px rgba(0,0,0,0.8)',
}}
```

### グラデーション
```tsx
style={{
  background: 'linear-gradient(to bottom, #00bfff, #003366)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}}
```

## テキストの安全ルール
- 画面端から最低5%のマージンを確保する
- 長いテキストは `wordBreak: 'break-word'` で自動改行
- フォントサイズの下限は24px（視認性確保）
- 重要なテキストには縁取りか影を必ずつける（背景に埋もれ防止）
