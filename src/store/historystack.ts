import { create } from "zustand";
import { persist } from "zustand/middleware";

type HistoryStackType = {
  historyStack: string[];
  lastEntry: string | null;
  lastPage: string | null;
  popHistory: () => string | undefined;
  pushHistory: (entry: string) => void;
};

export const useHistoryStack = create(
  persist(
    (set, get) => ({
      historyStack: [],
      lastEntry: null,
      lastPage: null,
      popHistory: () => {
        const history = get().historyStack;
        history.pop();
        set(() => ({ historyStack: history }));
        return history.length ? history[history.length - 1] : undefined;
      },
      pushHistory: (entry: string) =>
        set((prev: HistoryStackType) => ({
          lastPage: prev.historyStack
            ? prev.historyStack[prev.historyStack.length - 1]
            : null,
          historyStack: [...new Set([...prev.historyStack, entry])],
          lastEntry: entry,
        })),
    }),
    {
      name: "localStorage",
      partialize: (state: HistoryStackType) => ({
        lastPage: state.lastPage,
      }),
    }
  )
);
