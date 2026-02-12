"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type HistoryStackType = {
  historyStack: string[];
  prevPage: string | null;
  recentlyOpened: string | null;
  popHistory: () => string | undefined;
  pushHistory: (entry: string) => void;
  setHistory: (updater: (history: string[]) => string[]) => void;
};

export const useHistoryStack = create(
  persist(
    (set, get) => ({
      historyStack: [],
      prevPage: null,
      recentlyOpened: null,

      popHistory: () => {
        const history = get().historyStack;
        history.pop();
        set(() => ({
          historyStack: history,
          prevPage: history.at(-1),
        }));
        return history.length ? history[history.length - 1] : undefined;
      },

      pushHistory: (entry: string) => {
        set((prev) => ({
          historyStack: [...new Set([...prev.historyStack, entry])],
          prevPage: prev.historyStack.at(-1),
          recentlyOpened: entry,
        }));

        console.log("Pushed", entry, "in history stack, now it looks like this", get());
      },

      setHistory: (updater) => {
        set((prev: HistoryStackType) => ({
          historyStack: updater(prev.historyStack),
        }))
      }
    }),
    {
      name: "historyStack",
      partialize: (state: HistoryStackType) => ({
        recentlyOpened: state.recentlyOpened,
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
  const { setHistory, historyStack, recentlyOpened, prevPage, popHistory, pushHistory } = useHistoryStack();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user navigated backwards
    if (pathname === prevPage) {
      popHistory();
    }

  }, [pathname]);

  return {
    back: () => {
      popHistory();
      // console.log("popping from history stack", pathname, recentlyOpened, recentlyOpened && recentlyOpened !== pathname);
      router.replace(prevPage && prevPage !== pathname ? prevPage : recentlyOpened && recentlyOpened !== pathname ? recentlyOpened : "/home");
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