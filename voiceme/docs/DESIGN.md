# Voice Me — MVP設計書

## 1. コンセプト
「声を変える」のではなく「自分の声を好きになり、話すことに自信を持てるようにする」。
心理的変化（コンプレックス→強みを知る→改善点を知る→練習→変化を実感→自信）をUXの中心に据える。

## 2. 技術スタック
| レイヤー | 選定 | 理由 |
|---|---|---|
| フロントエンド | Next.js 14 (App Router) + TypeScript | 画面遷移が明確な10画面構成に合う。将来のSSR/APIルート拡張が容易 |
| スタイリング | Tailwind CSS | モバイルファーストで素早く上品・親しみやすいUIを構築 |
| 音声録音 | MediaRecorder API | ブラウザ標準、追加SDK不要 |
| 音声解析 | Web Audio API（クライアント内DSP） | 音声データを外部送信せずにプライバシーを守りつつ、話速・音量・ポーズ・ピッチ変動などを実測。外部AI APIキー無しでMVPを成立させ、将来的に本格的なAI/ASPサービスへ`AnalysisProvider`インターフェース越しに差し替え可能にする |
| 状態保存 | localStorage（`voiceme.*`キー） | MVPではログイン無し。将来のDB移行を見据え、保存ロジックを`lib/store`に集約 |
| 将来DB | Prisma schema（未接続） | ユーザー・録音・分析・レッスン完了・商品クリックのモデルを先に定義 |

## 3. ディレクトリ構成
```
voiceme/
  src/
    app/
      page.tsx                  # ホーム画面 (10)
      welcome/page.tsx          # ウェルカム画面 (1)
      concerns/page.tsx         # 声の悩み選択 (2)
      goals/page.tsx            # なりたい話し方選択 (3)
      record/page.tsx           # 音声録音 (4) / 再録音 (8) 共用
      analyzing/page.tsx        # AI分析中 (5)
      result/[sessionId]/page.tsx  # 声カルテ (6)
      lesson/[sessionId]/page.tsx  # 今日の3分レッスン (7)
      compare/[sessionId]/page.tsx # Before/After (9)
    components/                 # RecordButton, WaveformView, ScoreRadar, MetricBar, ProductCard...
    lib/
      analysis/                 # dsp.ts, features.ts, scoring.ts, feedback.ts
      lessons/                  # lessons.ts (3分レッスン定義)
      concerns.ts, goals.ts     # 選択肢マスタ
      products/                 # dummy products.json + affiliate表示ロジック
      store/                    # localStorage CRUD, 型定義
    types/                      # 共有ドメイン型
  prisma/schema.prisma          # 将来のサーバーDB定義（フェーズ2以降で接続）
  docs/DESIGN.md                # 本書
```

## 4. データモデル（フロント型 / 将来DBの土台）
```ts
ConcernKey: 声が小さい/こもる/早口/滑舌/抑揚なし/語尾弱い/緊張/声が嫌い/自信がない/聞き返される (10種)
GoalKey: 明るく親しみやすい/上品で知的/聞き取りやすい/信頼感がある/優しく安心感がある/
         説得力がある/接客向け/プレゼン向け/面接向け/音声配信向け (10種)
MetricKey: speed | volume | clarity | articulation | pause | intonation | stability | listenability

AnalysisResult {
  id, createdAt, durationSec,
  scores: Record<MetricKey, number>,      // 0-100
  strengths: string[],                    // 必ず1件以上
  improvements: string[],                 // 否定語禁止・提案調
  todayPoint: string,
  recommendedLessonId: LessonId,
}

RecordingSession {
  id, createdAt, concerns: ConcernKey[], goals: GoalKey[],
  before: AnalysisResult, after?: AnalysisResult,
  lessonId?, lessonCompletedAt?,
}
```
Prisma（将来用）: `User / Recording / Analysis / LessonCompletion / ProductClick` を1:多で接続し、
`Recording.audioDeleted: boolean` でユーザーによる音声削除を管理できる形にしてある。

## 5. API設計（将来のサーバー分析・課金接続を見据えたルート）
MVPは分析をクライアント内で完結させるため、サーバーAPIは最小限：
- `GET /api/products` — ダミーのアフィリエイト商品JSONを返す（Phase2でASP APIに置換）
- `POST /api/track` — KPIイベント（re_record, lesson_complete, compare_view, product_click）をログに記録するスタブ（現状はconsole/no-op、将来はDB/分析基盤に接続）

音声そのものやAPIキーはフロントに置かず、将来の本格AI分析はサーバー側ルート `POST /api/analyze`（未実装のプレースホルダをコメントで用意）経由でのみ秘密鍵を扱う設計とする。

## 6. AI音声分析（MVPの実装方式）
`lib/analysis` にてブラウザの`AudioContext.decodeAudioData`でPCMを取得し、以下を計算：
1. 短時間RMS（25msフレーム・10msホップ）→ 発話区間検出（VAD）、音量スコア
2. 無音区間の連続長 → ポーズ回数・比率 → 間の取り方スコア
3. エネルギー包絡のピーク検出 → モーラ相当の発話速度 → 話す速度スコア
4. 軽量FFT（512点）によるスペクトル重心・スペクトルフラットネス → 明瞭度・滑舌スコア
5. 自己相関法によるフレーム基本周波数(F0)推定 → 変動係数で抑揚スコア、フレーム間ジッタで安定性スコア
6. 上記を重み付け合成し「聞き取りやすさ」総合スコアを算出

すべてのスコアに対し、**否定語を使わないテンプレートエンジン**（`feedback.ts`）が
「強み→改善ポイント→今日のポイント」の順で文章を生成し、最もスコアが低い（＝伸びしろが大きい）
指標から「今日の3分レッスン」を1つ選ぶ。

## 7. 画面一覧（10画面）
1. ウェルカム 2. 悩み選択 3. なりたい話し方選択 4. 音声録音 5. AI分析中
6. 声カルテ 7. 今日の3分レッスン 8. 再録音 9. Before/After 10. ホーム

## 8. MVP実装順序
1. 型定義・localStorageストア
2. 音声解析エンジン（DSP→特徴量→スコアリング→フィードバック文生成）
3. 録音UI（波形表示・30秒タイマー）
4. 分析中→声カルテ→3分レッスン→再録音→Before/After
5. ホーム画面（今日のスコア・課題・成長履歴）
6. ダミー商品（Phase2 UI枠のみ、PR表記あり）
7. 通し動作確認（lint/build）

## 9. 計測ポイント（KPI）
`lib/store/analytics.ts` にイベントを集約し、最重要KPIである「再録音率」をはじめ
3分レッスン完了率・Before/After比較率・商品クリック率などをローカルに記録（将来はサーバー集計に接続）。
