export type Frequency = "core" | "common" | "rare";

export type RadicalExample = {
  character: string;
  pinyin: string;
  english: string;
  vietnamese: string;
};

export type Radical = {
  id: number;
  character: string;
  simplified?: string;
  variant?: string;
  pinyin: string;
  english: string;
  vietnamese: string;
  strokes: number;
  frequency: Frequency;
  icon: string;
  writerChar: string;
  story: { en: string; vi: string };
  examples: RadicalExample[];
};

export type Lang = "en" | "vi";
