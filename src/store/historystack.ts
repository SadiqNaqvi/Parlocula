import { usePathname, useRouter } from "next/navigation";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type HistoryStackType = {
  historyStack: string[];
  lastEntry: string | null;
  lastPage: string | null;
  popHistory: () => string | undefined;
  pushHistory: (entry: string) => void;
  setHistory: (updater: (history: string[]) => string[]) => void;
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
            ? prev.historyStack.at(-1)
            : null,
          historyStack: [...new Set([...prev.historyStack, entry])],
          lastEntry: entry,
        })),

      setHistory: (updater) => {
        set((prev: HistoryStackType) => ({
          historyStack: updater(prev.historyStack),
        }))
      }
    }),
    {
      name: "historyStack",
      partialize: (state: HistoryStackType) => ({
        lastPage: state.lastPage,
      }),
    }
  )
);

export type AppNavigationInstance = {
  back: () => void,
  replace: (href: string) => void,
  goto: (href: string) => void
}

export const useNavigation = (): AppNavigationInstance => {
  const { setHistory, historyStack, lastPage, popHistory, pushHistory } = useHistoryStack();
  const router = useRouter();
  const pathname = usePathname();

  return {
    back: () => {
      popHistory();
      router.replace(lastPage && lastPage !== pathname ? lastPage : "/home");
    },
    replace: (href: string) => {
      setHistory((history) => {
        const temphistory = [...history];
        temphistory.pop();
        temphistory.push(href);
        return temphistory;
      });
      router.replace(href);
    },
    goto: (href: string) => {
      if (!historyStack.length) pushHistory(pathname);

      pushHistory(href);
      router.push(href);
    }
  }

}