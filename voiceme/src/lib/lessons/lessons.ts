import type { Lesson, LessonId, MetricKey } from "@/types/domain";

export const LESSONS: Record<LessonId, Lesson> = {
  slow_down: {
    id: "slow_down",
    targetMetric: "speed",
    title: "ゆっくり話す練習",
    durationSec: 180,
    summary: "文の最後の一言を、意識してゆっくり話す練習です。",
    steps: [
      "深呼吸を1回して、肩の力を抜きましょう。",
      "文章をいつもの速さで声に出してみましょう。",
      "同じ文章を、最後の一言だけ半分の速さで話してみましょう。",
      "全体を通しで、心の中で『ゆっくり』と唱えながら話してみましょう。",
    ],
    practiceSentence: "本日はお時間をいただき、ありがとうございます。",
  },
  opening_volume: {
    id: "opening_volume",
    targetMetric: "volume",
    title: "第一声をしっかり出す練習",
    durationSec: 180,
    summary: "話し始めの一声にお腹から息を通す練習です。",
    steps: [
      "お腹に手を当てて、大きく息を吸いましょう。",
      "最初の一言だけ、少し大きめの声で発声してみましょう。",
      "口を大きく開けて、最初の母音をはっきり出してみましょう。",
      "文全体を、第一声のトーンを保ったまま話してみましょう。",
    ],
    practiceSentence: "おはようございます、本日もよろしくお願いいたします。",
  },
  emphasize_keywords: {
    id: "emphasize_keywords",
    targetMetric: "intonation",
    title: "キーワードを強調する練習",
    durationSec: 180,
    summary: "伝えたい言葉に、声の高さで色をつける練習です。",
    steps: [
      "文章の中で一番伝えたい言葉を1つ選びましょう。",
      "その言葉だけ、少し高く・少しゆっくり話してみましょう。",
      "他の部分は普段どおりのトーンで話してみましょう。",
      "強弱をつけながら、通しで話してみましょう。",
    ],
    practiceSentence: "この商品の一番の魅力は、使いやすさです。",
  },
  hold_endings: {
    id: "hold_endings",
    targetMetric: "stability",
    title: "語尾まで声を残す練習",
    durationSec: 180,
    summary: "文の最後まで息と声量を保つ練習です。",
    steps: [
      "文の最後の3文字を意識して声に出してみましょう。",
      "語尾が消えないよう、少し長めに伸ばして話してみましょう。",
      "『です』『ます』をはっきり発音してみましょう。",
      "通しで話して、最後まで聞き取れるか確認してみましょう。",
    ],
    practiceSentence: "ご不明な点がございましたら、お気軽にお申し付けください。",
  },
  articulation_drill: {
    id: "articulation_drill",
    targetMetric: "articulation",
    title: "口をしっかり動かす滑舌練習",
    durationSec: 180,
    summary: "母音をはっきり発音して輪郭のある声にする練習です。",
    steps: [
      "『あえいうえおあお』をゆっくりはっきり発音しましょう。",
      "口を大きく動かすことを意識してもう一度発音しましょう。",
      "早口言葉を、ゆっくり・はっきり話してみましょう。",
      "練習文を、口の動きを意識しながら話してみましょう。",
    ],
    practiceSentence: "隣の客はよく柿食う客だ。",
  },
  pause_control: {
    id: "pause_control",
    targetMetric: "pause",
    title: "間の取り方を整える練習",
    durationSec: 180,
    summary: "句読点で軽く間を取り、聞き手が理解しやすい間隔をつくる練習です。",
    steps: [
      "文章の句読点に、小さく『・』を書き込むイメージを持ちましょう。",
      "句読点のところで、心の中で1拍おいてみましょう。",
      "間を意識しながら、文章を声に出してみましょう。",
      "間を保ったまま、少しゆっくりめに通しで話してみましょう。",
    ],
    practiceSentence: "まず結論からお伝えします。その後、詳しい理由をご説明します。",
  },
  pitch_variation: {
    id: "pitch_variation",
    targetMetric: "intonation",
    title: "声に高低の変化をつける練習",
    durationSec: 180,
    summary: "抑揚を意識して、単調に聞こえない話し方を作る練習です。",
    steps: [
      "文章を、絵本の読み聞かせのように大げさに読んでみましょう。",
      "大げさな高低をだんだん自然な範囲に近づけていきましょう。",
      "質問文のように、語尾を少し上げて話してみましょう。",
      "通しで、自然な抑揚を意識して話してみましょう。",
    ],
    practiceSentence: "今日のご案内は、いかがでしたでしょうか。",
  },
  stability_breathing: {
    id: "stability_breathing",
    targetMetric: "stability",
    title: "声を安定させる呼吸練習",
    durationSec: 180,
    summary: "腹式呼吸で、声の震えやばらつきを整える練習です。",
    steps: [
      "4秒吸って、4秒かけて『はー』と声を出してみましょう。",
      "同じ呼吸で、練習文の前半だけ話してみましょう。",
      "同じ呼吸のまま、後半まで話してみましょう。",
      "呼吸を整えたまま、通しで話してみましょう。",
    ],
    practiceSentence: "落ち着いて、ゆっくりとお話しさせていただきます。",
  },
};

export function getLesson(id: LessonId): Lesson {
  return LESSONS[id];
}

export const METRIC_TO_LESSON: Record<MetricKey, LessonId> = {
  speed: "slow_down",
  volume: "opening_volume",
  clarity: "articulation_drill",
  articulation: "articulation_drill",
  pause: "pause_control",
  intonation: "emphasize_keywords",
  stability: "stability_breathing",
  listenability: "pause_control",
};
