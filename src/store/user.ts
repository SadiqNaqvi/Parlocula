import { oneHour } from "@lib/constants";
import { decodeObject, encodeObject } from "@lib/utils";
import { type User } from "@type/internal";
import { del, get, set } from "idb-keyval";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const idbStorage = {
  getItem: async (key: string) => await get(key),
  setItem: async (key: string, value: any) => {
    await set(key, value);
  },
  removeItem: async (key: string) => {
    await del(key);
  },
};

type MereContent = {
  _id: string;
  name: string;
  poster: string;
};

type ContentMutationProps =
  | {
      data: MereContent;
      action: "add";
    }
  | {
      data: { id: string };
      action: "remove";
    };

type UserStore = {
  user: User | null;
  userhash: Buffer<ArrayBuffer> | null;
  setUser: (data: User) => void;
  getUserFromHash: () => (User & { object_expiry: number }) | null;
  setUserHash: (data: User) => void;
  clearUser: () => void;

  isHydrated: boolean;

  threads: MereContent[];
  lists: MereContent[];
  updateThreads: (a: ContentMutationProps) => void;
  updateLists: (a: ContentMutationProps) => void;
};

const useCurrentUser = create(
  persist(
    (set, get) => ({
      user: null,
      userhash: null,
      isHydrated: false,

      setUser: (data: User) => set({ user: data }),

      setUserHash: (data: User) =>
        set({ userhash: encodeObject(data, 1000 * oneHour * 6), user: data }),

      getUserFromHash: () => decodeObject(get().userhash),

      clearUser: () => set({ user: null, userhash: null }),

      threads: [],
      lists: [],

      updateLists: ({ data, action }) => {
        let tempLists = get().lists;
        if (action === "add") {
          if (tempLists.length >= 20) tempLists.pop();
          tempLists.unshift(data);
        } else {
          tempLists = tempLists.filter((el) => el._id !== data.id);
        }
        set({ lists: tempLists });
      },

      updateThreads: ({ data, action }) => {
        let tempThreads = get().threads;
        if (action === "add") {
          if (tempThreads.length >= 20) tempThreads.pop();
          tempThreads.unshift(data);
        } else {
          tempThreads = tempThreads.filter((el) => el._id !== data.id);
        }
        set({ threads: tempThreads });
      },
    }),
    {
      name: "UserStorage",
      storage: idbStorage,
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
      partialize: (state: UserStore) => ({
        userhash: state.userhash,
        threads: state.threads,
        lists: state.lists,
      }),
    }
  )
);

export default useCurrentUser;
