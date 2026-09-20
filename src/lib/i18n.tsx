import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Lang } from "@/lib/types";

const STORAGE_KEY = "ink-roots-lang";

const en = {
  appName: "Ink Roots",
  tagline: "The 214 Kangxi radicals",
  intro:
    "Every Chinese character grows from a root. Learn the 214 Kangxi radicals — stroke by stroke, sound, story, and the words they unlock.",
  search: "Search by character, pinyin, or meaning",
  strokes: "Strokes",
  all: "All",
  core: "Core",
  common: "Common",
  rare: "Rare",
  learned: "Learned",
  practice: "Practice",
  radicals: "Radicals",
  playStrokes: "Play strokes",
  quizStrokes: "Trace it",
  listen: "Listen",
  examples: "In the wild",
  story: "Story",
  meaning: "Meaning",
  pinyin: "Pinyin",
  alsoWritten: "Also written",
  asComponent: "As a component",
  markLearned: "Mark learned",
  markedLearned: "Learned",
  of: "of",
  back: "All radicals",
  next: "Next",
  previous: "Previous",
  noResults: "No radicals match that search.",
  clearFilters: "Clear filters",
  strokeOrder: "Stroke order",
  quizTitle: "Practice",
  quizLead: "Ten questions. See the radical, choose the meaning.",
  startQuiz: "Start a round",
  nextQuestion: "Next",
  seeResults: "See results",
  playAgain: "Play again",
  score: "Score",
  correct: "Correct",
  questionOf: "Question",
  chooseMeaning: "What does this radical mean?",
  emptyLearned: "Mark radicals as learned from their pages — they will gather here.",
  footer: "Kangxi Dictionary, 1716. Two hundred and fourteen roots.",
  english: "English",
  vietnamese: "Tiếng Việt",
  tracing: "Trace each stroke in order.",
  replay: "Replay",
  outline: "Show outline",
  writerMissing: "Stroke data is not available for this form. The glyph is shown still.",
  progressLabel: "learned",
  simplified: "Simplified",
  traditional: "Kangxi form",
  skipToContent: "Skip to content",
  filterBy: "Filter",
  results: "radicals",
};

const vi: typeof en = {
  appName: "Ink Roots",
  tagline: "214 bộ thủ Khang Hy",
  intro:
    "Mỗi chữ Hán mọc lên từ một rễ. Học 214 bộ thủ Khang Hy — nét, âm, câu chuyện, và những chữ chúng mở ra.",
  search: "Tìm theo chữ, pinyin hoặc nghĩa",
  strokes: "Nét",
  all: "Tất cả",
  core: "Cốt lõi",
  common: "Phổ biến",
  rare: "Hiếm",
  learned: "Đã học",
  practice: "Luyện tập",
  radicals: "Bộ thủ",
  playStrokes: "Chạy nét",
  quizStrokes: "Viết theo nét",
  listen: "Nghe",
  examples: "Ngoài đời",
  story: "Câu chuyện",
  meaning: "Nghĩa",
  pinyin: "Pinyin",
  alsoWritten: "Còn viết",
  asComponent: "Khi làm bộ",
  markLearned: "Đánh dấu đã học",
  markedLearned: "Đã học",
  of: "trên",
  back: "Tất cả bộ thủ",
  next: "Tiếp",
  previous: "Trước",
  noResults: "Không có bộ thủ khớp tìm kiếm.",
  clearFilters: "Xóa bộ lọc",
  strokeOrder: "Thứ tự nét",
  quizTitle: "Luyện tập",
  quizLead: "Mười câu. Nhìn bộ thủ, chọn nghĩa.",
  startQuiz: "Bắt đầu lượt",
  nextQuestion: "Câu tiếp",
  seeResults: "Xem kết quả",
  playAgain: "Chơi lại",
  score: "Điểm",
  correct: "Đúng",
  questionOf: "Câu",
  chooseMeaning: "Bộ thủ này nghĩa là gì?",
  emptyLearned: "Đánh dấu đã học trên trang bộ thủ — chúng sẽ gom lại đây.",
  footer: "Khang Hy tự điển, 1716. Hai trăm mười bốn rễ chữ.",
  english: "English",
  vietnamese: "Tiếng Việt",
  tracing: "Viết lần lượt từng nét.",
  replay: "Phát lại",
  outline: "Hiện khung",
  writerMissing: "Không có dữ liệu nét cho dạng này. Chữ được hiện tĩnh.",
  progressLabel: "đã học",
  simplified: "Giản thể",
  traditional: "Dạng Khang Hy",
  skipToContent: "Bỏ qua đến nội dung",
  filterBy: "Lọc",
  results: "bộ thủ",
};

const dictionaries = { en, vi };
export type MessageKey = keyof typeof en;

type I18nValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

function readStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "vi" || v === "en" ? v : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = readStoredLang();
    if (stored !== "en") setLangState(stored);
    document.documentElement.lang = stored === "vi" ? "vi" : "en";
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore quota */
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = next === "vi" ? "vi" : "en";
    }
  }, []);

  const t = useCallback((key: MessageKey) => dictionaries[lang][key], [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
