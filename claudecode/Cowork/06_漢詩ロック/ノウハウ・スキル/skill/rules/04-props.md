# Props 設計ルール

## Zodスキーマの書き方
```tsx
import { z } from 'zod';

export const schema = z.object({
  // テキスト系
  text: z.string().describe('表示するテキスト'),
  fontSize: z.number().min(12).max(200).describe('フォントサイズ（px）'),

  // 色系（カラーコード）
  textColor: z.string().describe('文字色（例: #ffffff）'),
  backgroundColor: z.string().describe('背景色（例: #1a1a2e）'),

  // 数値系
  animationDuration: z.number().min(1).max(300).describe('アニメーション時間（フレーム数）'),

  // 選択肢
  fontFamily: z.enum(['sans-serif', 'serif', 'monospace']).describe('フォント種類'),
});

export type SchemaType = z.infer<typeof schema>;
```

## defaultProps の設定
```tsx
export const defaultProps: SchemaType = {
  text: 'サンプルテキスト',
  fontSize: 48,
  textColor: '#ffffff',
  backgroundColor: '#1a1a2e',
  animationDuration: 30,
  fontFamily: 'sans-serif',
};
```

## コンポジションへの適用
```tsx
<Composition
  id="MyVideo"
  component={MyComponent}
  durationInFrames={150}
  fps={30}
  width={1920}
  height={1080}
  schema={schema}
  defaultProps={defaultProps}
/>
```

## Props のグループ化（見やすくする）
```tsx
export const schema = z.object({
  // テロップ設定グループ
  telop: z.object({
    text: z.string().describe('テキスト内容'),
    fontSize: z.number().describe('フォントサイズ'),
    color: z.string().describe('文字色'),
  }).describe('テロップ設定'),

  // 背景設定グループ
  background: z.object({
    color: z.string().describe('背景色'),
    opacity: z.number().min(0).max(1).describe('透明度'),
  }).describe('背景設定'),
});
```

## Props 活用の原則
- AIが「仕組みを作る」→ 人間がPropsで「見た目を微調整」
- 調整したくなる値は必ずPropsに切り出す
- `.describe()` は必ず書く（Remotion Studioに説明文が表示される）
