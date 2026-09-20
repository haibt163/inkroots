import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProgressState = {
  learned: number[];
  toggleLearned: (id: number) => void;
  isLearned: (id: number) => boolean;
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      learned: [],
      toggleLearned: (id) =>
        set((s) => ({
          learned: s.learned.includes(id)
            ? s.learned.filter((x) => x !== id)
            : [...s.learned, id],
        })),
      isLearned: (id) => get().learned.includes(id),
    }),
    { name: "ink-roots-progress" },
  ),
);
