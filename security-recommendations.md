# セキュリティ向上の推奨事項

## 📋 完了した対策

### ✅ APIキーの安全化
- config.jsから機密情報を削除
- 環境変数による管理に変更
- 古いAPIキーの無効化を推奨

### ✅ Content Security Policy (CSP) 実装
- 全HTMLファイルにCSPヘッダーを追加
- スクリプト、スタイル、画像、フレームの制限設定
- upgrade-insecure-requests による HTTPS 強制

### ✅ XSS脆弱性の修正
- contact.htmlの入力値サニタイゼーション
- 強化されたバリデーション機能
- mailto機能を無効化し、セキュアな処理に変更

## 🔧 追加で推奨される対策

### 1. 外部依存関係の最小化
現在の外部依存:
- Tailwind CSS CDN
- Google Fonts
- YouTube API

**推奨**: 可能であれば以下をローカルホスティングに変更
```bash
# Tailwind CSS をローカルに
npm install tailwindcss
# Google Fonts をローカルに
npm install @fontsource/zen-kaku-gothic-antique
```

### 2. HTTPSとHSTSの設定
Web サーバー設定に以下を追加:

**Apache (.htaccess)**
```apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

**Nginx**
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
return 301 https://$server_name$request_uri;
```

### 3. 追加のセキュリティヘッダー
```html
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
```

### 4. 環境変数の設定方法

**本番環境での環境変数設定**
```bash
# Linux/Mac
export YOUTUBE_API_KEY="your_new_api_key_here"

# Windows
set YOUTUBE_API_KEY=your_new_api_key_here
```

**Node.js環境での.env ファイル**
```
YOUTUBE_API_KEY=your_new_api_key_here
```

## 🚨 緊急対応リマインダー

### すぐに実行してください:
1. **Google Cloud Console** でAPIキー `[REDACTED-LEAKED-KEY]` を削除
2. 新しいAPIキーを作成し、適切な制限を設定
3. 環境変数 `YOUTUBE_API_KEY` を設定

### APIキー制限設定:
- **API制限**: YouTube Data API v3 のみ
- **HTTPリファラー制限**: `https://your-domain.com/*`
- **使用量制限**: 10,000リクエスト/日

## 📊 セキュリティチェック完了

- ✅ APIキー漏洩対策
- ✅ XSS攻撃防止
- ✅ CSP実装
- ✅ 入力値検証強化
- ✅ HTTPS強制設定
- ⚠️ 外部依存関係の最小化（推奨）
- ⚠️ サーバーレベルのセキュリティヘッダー（推奨）

現在のウェブサイトは基本的なセキュリティ対策が完了しています。