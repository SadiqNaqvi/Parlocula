import { oneHour } from "@lib/constants";
import { decodeObject, encodeObject } from "@lib/utils";
import { type User } from "@type/internal";
import localforage from "localforage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const localForageStorage = {
  getItem: async (key: string): Promise<any> => {
    const data = await localforage.getItem(key);
    return data ?? null;
  },
  setItem: async (key: string, value: any): Promise<void> => {
    await localforage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await localforage.removeItem(key);
  },
};

export type UserMetaData = {
  user_id: string;
  username: string;
  profile: string | undefined;
};

type UserStore = {
  user: User | null;
  // userhash is stored locally for offline access
  userhash: Buffer<ArrayBuffer> | null;
  // meta will be updated based on the token and session. it is not stored locally instead it is set every time the app mounts
  meta: UserMetaData | null;
  setUser: (data: User) => void;
  setUserMeta: (meta: UserMetaData) => void;
  getUserFromHash: () => (User & { object_expiry: number }) | null;
  setUserHash: (data: User) => void;
  clearUser: () => void;

  isHydrated: boolean;
};

const useCurrentUser = create(
  persist(
    (set, get) => ({
      user: null,
      userhash: null,
      meta: null,
      isHydrated: false,

      setUser: (data: User) => set({ user: data }),
      setUserMeta: (meta: UserMetaData) => set({ meta }),
      setUserHash: (data: User) =>
        set({ userhash: encodeObject(data, 1000 * oneHour * 6), user: data }),

      getUserFromHash: () => decodeObject(get().userhash),

      clearUser: () => set({ user: null, userhash: null }),
    }),
    {
      name: "UserStorage",
      storage: localForageStorage,
      onRehydrateStorage: () => (state) => {
        if (state)
          setTimeout(() => {
            useCurrentUser.setState({ isHydrated: true });
          }, 0);
      },
      partialize: (state: UserStore) => ({
        userhash: state.userhash,
      }),
    }
  )
);

export default useCurrentUser;
