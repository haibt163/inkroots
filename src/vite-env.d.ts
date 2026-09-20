/// <reference types="vite/client" />

declare module "*.css?url" {
  const href: string;
  export default href;
}

declare module "hanzi-writer" {
  export type HanziWriterOptions = {
    width?: number;
    height?: number;
    padding?: number;
    strokeColor?: string;
    radicalColor?: string;
    outlineColor?: string;
    drawingColor?: string;
    highlightColor?: string;
    strokeAnimationSpeed?: number;
    delayBetweenStrokes?: number;
    delayBetweenLoops?: number;
    showOutline?: boolean;
    showCharacter?: boolean;
    strokeHighlightSpeed?: number;
    highlightOnComplete?: boolean;
    charDataLoader?: (
      char: string,
      onComplete: (data: unknown) => void,
      onError: (err?: unknown) => void,
    ) => void;
    onLoadCharDataSuccess?: (data: unknown) => void;
    onLoadCharDataError?: (err?: unknown) => void;
  };

  export type QuizOptions = {
    onComplete?: (summary: { totalMistakes: number }) => void;
    onCorrectStroke?: () => void;
    onMistake?: () => void;
    leniency?: number;
    quizStartStrokeNum?: number;
    showHintAfterMisses?: number | false;
    highlightOnComplete?: boolean;
    acceptBackwardsStrokes?: boolean;
  };

  export default class HanziWriter {
    static create(
      element: string | HTMLElement,
      character: string,
      options?: HanziWriterOptions,
    ): HanziWriter;
    animateCharacter(): Promise<void>;
    loopCharacterAnimation(): void;
    pauseAnimation(): void;
    resumeAnimation(): void;
    showCharacter(): Promise<void>;
    hideCharacter(): Promise<void>;
    showOutline(): Promise<void>;
    hideOutline(): Promise<void>;
    updateColor(colorName: string, colorValue: string, duration?: number): Promise<void>;
    quiz(options?: QuizOptions): void;
    cancelQuiz(): void;
    setCharacter(char: string): Promise<void>;
    triggerLoading(): void;
  }
}
