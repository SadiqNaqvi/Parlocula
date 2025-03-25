import { create } from "zustand";
import { type User } from "@type/internal";
import { persist } from "zustand/middleware";
import { encodeObject, decodeObject } from "@lib/utils";
import { oneHour } from "@lib/constants";

type UserStore = {
  user: User | null;
  userhash: Buffer<ArrayBuffer> | null;
  username: string | null;
  profile: string | null;
  isGuest: boolean;
  setUser: (data: User) => void;
  getUserFromHash: () => (User & { object_expiry: number }) | null;
  updateUser: (data: Partial<User>) => void;
  setUserHash: (data: User) => void;
  clearUser: () => void;
};

const useCurrentUser = create(
  persist(
    (set, get) => ({
      user: null,
      isGuest: true,
      userhash: null,
      username: null,
      profile: null,
      setUser: (data: User) =>
        set({
          user: data,
          username: data.username,
          profile: data.profile,
          isGuest: false,
        }),
      updateUser: (data: Partial<User>) =>
        set(({ user }) => ({ user: user ? { ...user, ...data } : null })),
      setUserHash: (data: User) => {
        set({
          userhash: encodeObject(data, 1000 * oneHour * 6),
          user: data,
          username: data.username,
          profile: data.profile,
          isGuest: false,
        });
      },
      getUserFromHash: () => decodeObject(get().userhash),
      clearUser: () => set({ user: null, userhash: null, isGuest: true }),
    }),
    {
      name: "UserStorage",
      partialize: (state: UserStore) => ({
        isGuest: state.isGuest,
        userhash: state.userhash,
        username: state.username,
        profile: state.profile,
      }),
    }
  )
);

export default useCurrentUser;
