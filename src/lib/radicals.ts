import data from "@/data/radicals.json";
import type { Frequency, Radical } from "@/lib/types";

export const RADICALS = data as Radical[];
export const RADICAL_COUNT = RADICALS.length;

const byId = new Map(RADICALS.map((r) => [r.id, r]));

export function getRadical(id: number): Radical | undefined {
  return byId.get(id);
}

export function strokeCounts(): number[] {
  return [...new Set(RADICALS.map((r) => r.strokes))].sort((a, b) => a - b);
}

export function meaningOf(r: Radical, lang: "en" | "vi"): string {
  return lang === "vi" ? r.vietnamese : r.english;
}

export function storyOf(r: Radical, lang: "en" | "vi"): string {
  return lang === "vi" ? r.story.vi : r.story.en;
}

export function exampleMeaning(
  ex: Radical["examples"][number],
  lang: "en" | "vi",
): string {
  return lang === "vi" ? ex.vietnamese : ex.english;
}

export function matchesQuery(r: Radical, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return (
    r.character.includes(s) ||
    (r.simplified?.includes(s) ?? false) ||
    (r.variant?.includes(s) ?? false) ||
    r.pinyin.toLowerCase().includes(s) ||
    r.english.toLowerCase().includes(s) ||
    r.vietnamese.toLowerCase().includes(s) ||
    String(r.id) === s ||
    r.examples.some(
      (ex) =>
        ex.character.includes(s) ||
        ex.pinyin.toLowerCase().includes(s) ||
        ex.english.toLowerCase().includes(s) ||
        ex.vietnamese.toLowerCase().includes(s),
    )
  );
}

export function filterRadicals(opts: {
  query: string;
  strokes: number | "all";
  frequency: Frequency | "all" | "learned";
  learnedIds: Set<number>;
}): Radical[] {
  return RADICALS.filter((r) => {
    if (!matchesQuery(r, opts.query)) return false;
    if (opts.strokes !== "all" && r.strokes !== opts.strokes) return false;
    if (opts.frequency === "learned") return opts.learnedIds.has(r.id);
    if (opts.frequency !== "all" && r.frequency !== opts.frequency) return false;
    return true;
  });
}

export function neighbors(id: number): { prev?: Radical; next?: Radical } {
  const prev = byId.get(id - 1);
  const next = byId.get(id + 1);
  return { prev, next };
}
