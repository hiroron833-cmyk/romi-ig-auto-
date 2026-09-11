# Voice Me（MVP）

「声を変える」のではなく、自分の声を好きになり、話すことに自信を持てるようにするAIボイスコーチアプリのMVPです。
詳しい設計は [`docs/DESIGN.md`](./docs/DESIGN.md) を参照してください。

## セットアップ

```bash
npm install
npm run dev
```

`http://localhost:3000/welcome` からフローを開始できます（スマートフォンでの利用を想定しています）。

マイクを使用するため、ブラウザからのマイク許可が必要です。音声はサーバーに送信されず、
すべてブラウザ内（Web Audio API）で解析されます。

## スクリプト

- `npm run dev` — 開発サーバー起動
- `npm run build` — 本番ビルド
- `npm run lint` — ESLint

## 主要ディレクトリ

- `src/app` — 画面（ウェルカム〜ホームまで10画面）
- `src/lib/analysis` — クライアント内の音声解析エンジン（DSP → 特徴量 → スコアリング → フィードバック生成）
- `src/lib/lessons` — 今日の3分レッスンの定義
- `src/lib/products` — Phase2向けダミーアフィリエイト商品
- `src/lib/store` — localStorageベースの状態管理（将来DB接続用に`prisma/schema.prisma`を用意）
