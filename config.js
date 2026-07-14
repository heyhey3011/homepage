// YouTube API設定
// セキュリティ向上のため、APIキーは別ファイルで管理
// config.local.js ファイルで window.YOUTUBE_API_KEY を設定してください

const CONFIG = {
    // YouTube Data API v3 設定
    YOUTUBE: {
        // この行を変更します
        API_KEY: '__YOUTUBE_API_KEY__', // 合言葉に置き換える
        CHANNEL_ID: 'UCerBISByAKR3KU9CD9Tz5ZQ',
        
        // ピックアップ動画リスト（recommended-videos.html用）
        PICKUP_LIST_1_IDS: [
            'IwBnAvPYRh0', 'DQA-R_DkEhU', '1xL8CaRDU_Q', 'asWq0vICQ-Q' // 初心者向け動画IDを4つ
        ],
        PICKUP_LIST_2_IDS: [
            'YIuOy8K5GzY', 'dCA1KRYJKHU', 'ZDSFoBrDqUU', 'BG5kIRN7rns' // 中級者向け動画IDを4つ
        ],
        
        // API制限設定（Google Cloud Consoleで設定）
        // - HTTPリファラー制限: https://your-domain.com/*
        // - API制限: YouTube Data API v3のみ
        // - 使用量制限: 10,000リクエスト/日
    },
    
    // セキュリティ設定
    SECURITY: {
        // 本番環境でのみAPIキーを使用
        USE_API_IN_PRODUCTION: true,

        // フォールバック値（APIキー未設定・取得失敗時に「約◯◯人／本」の形で表示）
        // ※実際の数値に合わせて調整してください。自動取得が成功した場合は上書きされます。
        FALLBACK_SUBSCRIBER_COUNT: 3600,
        FALLBACK_VIDEO_COUNT: 900,

        // APIエラー時の再試行設定
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 2000 // 2秒
    }
};

// 設定を読み取り専用にする
Object.freeze(CONFIG);
Object.freeze(CONFIG.YOUTUBE);
Object.freeze(CONFIG.SECURITY);