"use client";

import { useEffect, useMemo, useState } from "react";

type Word = {
  id: string;
  lemma: string;
  ipa: string;
  meaning: string;
  frequency: number;
  level: "A1" | "A2" | "B1" | "B2";
  family: string[];
  roots: string[];
  rules: string[];
  graphemes: { letters: string; sound: string; hint: string }[];
  conjugations?: Record<string, string>;
};

type Progress = Record<string, { mastery: number; due: string; mistakes: number; lastMode?: string }>;

const words: Word[] = [
  {
    id: "beaucoup",
    lemma: "beaucoup",
    ipa: "/boku/",
    meaning: "很多",
    frequency: 96,
    level: "A1",
    family: ["beau", "beauté", "bellement"],
    roots: ["beau"],
    rules: ["eau 通常读 /o/", "末尾 p 不发音", "ou 读 /u/"],
    graphemes: [
      { letters: "eau", sound: "/o/", hint: "像 eau, beau, cadeau" },
      { letters: "ou", sound: "/u/", hint: "嘴唇收圆，声音靠后" },
      { letters: "p", sound: "静音", hint: "词尾辅音常不发音" },
    ],
  },
  {
    id: "temps",
    lemma: "temps",
    ipa: "/tɑ̃/",
    meaning: "时间；天气",
    frequency: 94,
    level: "A1",
    family: ["temporel", "longtemps", "printemps"],
    roots: ["temp-"],
    rules: ["en/em 读鼻化 /ɑ̃/", "词尾 ps 不发音"],
    graphemes: [
      { letters: "em", sound: "/ɑ̃/", hint: "鼻化元音，别读出 m" },
      { letters: "ps", sound: "静音", hint: "temps 只保留开头 t 的声音" },
    ],
  },
  {
    id: "oiseau",
    lemma: "oiseau",
    ipa: "/wazo/",
    meaning: "鸟",
    frequency: 72,
    level: "A2",
    family: ["oisillon", "oiseleur"],
    roots: ["ois-"],
    rules: ["oi 读 /wa/", "s 在两个元音之间常读 /z/", "eau 读 /o/"],
    graphemes: [
      { letters: "oi", sound: "/wa/", hint: "不是 /oi/，而是滑向 a" },
      { letters: "s", sound: "/z/", hint: "两个元音之间浊化" },
      { letters: "eau", sound: "/o/", hint: "经典拼写块" },
    ],
  },
  {
    id: "parler",
    lemma: "parler",
    ipa: "/paʁle/",
    meaning: "说；讲话",
    frequency: 90,
    level: "A1",
    family: ["parole", "parleur", "reparler"],
    roots: ["parl-"],
    rules: ["er 动词不定式词尾读 /e/", "r 为小舌音 /ʁ/"],
    graphemes: [
      { letters: "ar", sound: "/aʁ/", hint: "r 不卷舌" },
      { letters: "er", sound: "/e/", hint: "一类动词词尾常见读法" },
    ],
    conjugations: {
      "je": "parle",
      "tu": "parles",
      "il/elle": "parle",
      "nous": "parlons",
      "vous": "parlez",
      "ils/elles": "parlent",
    },
  },
  {
    id: "manger",
    lemma: "manger",
    ipa: "/mɑ̃ʒe/",
    meaning: "吃",
    frequency: 84,
    level: "A1",
    family: ["mangeable", "mangeoire", "mangement"],
    roots: ["mang-"],
    rules: ["an 读鼻化 /ɑ̃/", "g + e/i 常读 /ʒ/", "er 读 /e/"],
    graphemes: [
      { letters: "an", sound: "/ɑ̃/", hint: "鼻化，不读 n" },
      { letters: "g", sound: "/ʒ/", hint: "像中文近似的 ri 声母，但更软" },
      { letters: "er", sound: "/e/", hint: "不定式尾音" },
    ],
    conjugations: {
      "je": "mange",
      "tu": "manges",
      "il/elle": "mange",
      "nous": "mangeons",
      "vous": "mangez",
      "ils/elles": "mangent",
    },
  },
  {
    id: "chateau",
    lemma: "château",
    ipa: "/ʃɑto/",
    meaning: "城堡",
    frequency: 61,
    level: "A2",
    family: ["châtelain", "castel", "châtellerie"],
    roots: ["chât-"],
    rules: ["ch 读 /ʃ/", "â 常提示较开口的 /ɑ/", "eau 读 /o/"],
    graphemes: [
      { letters: "ch", sound: "/ʃ/", hint: "类似 sh" },
      { letters: "â", sound: "/ɑ/", hint: "重音符号帮助区分词形" },
      { letters: "eau", sound: "/o/", hint: "别被三个字母吓到" },
    ],
  },
];

const modes = [
  ["dictation", "听音拼写"],
  ["pronunciation", "看词预测读音"],
  ["mapping", "音素-字母映射"],
  ["rules", "高频规则训练"],
  ["family", "词根/词族"],
  ["verbs", "动词变位"],
] as const;

const initialProgress = () =>
  Object.fromEntries(words.map((word) => [word.id, { mastery: 24, due: new Date().toISOString(), mistakes: 0 }]));

export default function FrenchLab() {
  const [mode, setMode] = useState<(typeof modes)[number][0]>("dictation");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [progress, setProgress] = useState<Progress>(initialProgress);
  const [reviewOnly, setReviewOnly] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("french-lab-progress");
    if (saved) setProgress(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("french-lab-progress", JSON.stringify(progress));
  }, [progress]);

  const queue = useMemo(() => {
    const due = words.filter((word) => new Date(progress[word.id]?.due ?? 0) <= new Date());
    return reviewOnly && due.length ? due : words;
  }, [progress, reviewOnly]);

  const word = queue[index % queue.length];
  const average = Math.round(Object.values(progress).reduce((sum, item) => sum + item.mastery, 0) / words.length);
  const weakWords = words.filter((item) => (progress[item.id]?.mistakes ?? 0) > 0 || progress[item.id]?.mastery < 55);

  function speak() {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(word.lemma);
    utterance.lang = "fr-FR";
    utterance.rate = 0.82;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function check() {
    const normalized = answer.trim().toLowerCase();
    const expected =
      mode === "pronunciation"
        ? word.ipa.toLowerCase()
        : mode === "verbs"
          ? Object.values(word.conjugations ?? {})[0]?.toLowerCase()
          : word.lemma.toLowerCase();
    const ok = normalized === expected || (mode === "mapping" && word.graphemes.some((g) => normalized.includes(g.sound)));
    const delta = ok ? 14 : -12;
    const days = ok ? Math.max(1, Math.round(((progress[word.id]?.mastery ?? 20) + 20) / 18)) : 1;
    const due = new Date(Date.now() + days * 86400000).toISOString();

    setProgress((current) => ({
      ...current,
      [word.id]: {
        mastery: Math.max(5, Math.min(100, (current[word.id]?.mastery ?? 20) + delta)),
        mistakes: (current[word.id]?.mistakes ?? 0) + (ok ? 0 : 1),
        due,
        lastMode: mode,
      },
    }));
    setFeedback(ok ? "答对了，下一次复习会稍微推后。" : `再看一眼：${word.lemma} ${word.ipa}，规则是 ${word.rules[0]}。`);
  }

  function next() {
    setIndex((value) => (value + 1) % queue.length);
    setAnswer("");
    setFeedback("");
  }

  function importOpenLexicon() {
    setFeedback("已预留导入接口：可接 Lexique、Wiktionary dump、OpenSubtitles 词频、Forvo/开放 TTS 音频索引。MVP 当前使用示例开放结构。");
  }

  return (
    <main>
      <section className="topbar">
        <div>
          <p className="eyebrow">法语拼写和读音记忆训练</p>
          <h1>法语拼读训练台</h1>
        </div>
        <button className="ghost" onClick={importOpenLexicon}>导入接口</button>
      </section>

      <section className="workspace">
        <aside className="sidebar" aria-label="训练模式">
          {modes.map(([id, label]) => (
            <button key={id} className={mode === id ? "active" : ""} onClick={() => { setMode(id); setAnswer(""); setFeedback(""); }}>
              {label}
            </button>
          ))}
          <label className="toggle">
            <input type="checkbox" checked={reviewOnly} onChange={(event) => setReviewOnly(event.target.checked)} />
            只练到期复习
          </label>
        </aside>

        <section className="trainer" aria-live="polite">
          <div className="wordHeader">
            <div>
              <span className="level">{word.level}</span>
              <h2>{word.lemma}</h2>
              <p>{word.meaning}</p>
            </div>
            <button className="listen" onClick={speak}>播放读音</button>
          </div>

          {mode === "dictation" && <Prompt title="听音拼写" text="先播放读音，再输入你听到的完整法语拼写。" />}
          {mode === "pronunciation" && <Prompt title="看词发音预测" text={`写出 IPA：${word.lemma} 的读音是什么？`} />}
          {mode === "mapping" && <Mapping word={word} />}
          {mode === "rules" && <RuleDeck word={word} />}
          {mode === "family" && <Family word={word} />}
          {mode === "verbs" && <VerbTrainer word={word} />}

          <div className="answerRow">
            <input
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && check()}
              placeholder={mode === "pronunciation" ? "例如 /boku/" : "输入答案"}
              aria-label="答案"
            />
            <button onClick={check}>检查</button>
            <button className="ghost" onClick={next}>下一题</button>
          </div>
          {feedback && <p className="feedback">{feedback}</p>}
        </section>

        <aside className="stats">
          <div className="meter">
            <strong>{average}%</strong>
            <span>平均掌握度</span>
          </div>
          <div className="statGrid">
            <span>词库规模接口</span><b>开放扩展</b>
            <span>当前示例词</span><b>{words.length}</b>
            <span>复习队列</span><b>{queue.length}</b>
          </div>
          <h3>错词本</h3>
          <div className="mistakes">
            {weakWords.map((item) => (
              <button key={item.id} onClick={() => { setIndex(queue.findIndex((w) => w.id === item.id)); setFeedback(""); }}>
                <span>{item.lemma}</span>
                <small>{progress[item.id]?.mastery ?? 0}%</small>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section className="architecture">
        <h2>开放词库架构预留</h2>
        <div className="pipeline">
          {["Open lexicon", "IPA / 音频", "词频", "规则标注", "间隔复习"].map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>
    </main>
  );
}

function Prompt({ title, text }: { title: string; text: string }) {
  return <div className="prompt"><h3>{title}</h3><p>{text}</p></div>;
}

function Mapping({ word }: { word: Word }) {
  return (
    <div className="tiles">
      {word.graphemes.map((item) => (
        <div className="tile" key={item.letters}>
          <b>{item.letters}</b><strong>{item.sound}</strong><span>{item.hint}</span>
        </div>
      ))}
    </div>
  );
}

function RuleDeck({ word }: { word: Word }) {
  return <div className="rules">{word.rules.map((rule) => <span key={rule}>{rule}</span>)}</div>;
}

function Family({ word }: { word: Word }) {
  return <div className="family"><p>词根：{word.roots.join(" / ")}</p>{word.family.map((item) => <span key={item}>{item}</span>)}</div>;
}

function VerbTrainer({ word }: { word: Word }) {
  if (!word.conjugations) return <Prompt title="动词变位训练" text="这个词不是当前变位题，点下一题寻找动词。" />;
  return <div className="conjugations">{Object.entries(word.conjugations).map(([subject, form]) => <span key={subject}><b>{subject}</b>{form}</span>)}</div>;
}
