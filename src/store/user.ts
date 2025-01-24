import { create } from "zustand";
import { type User } from "@type/internal";
import { persist } from "zustand/middleware";
import { encodeObject } from "@lib/utils";

type UserStore = {
  user: User | null;
  userhash: string | null;
  username: string | null;
  profile: string | null;
  setUser: (data: User) => void;
  updateUser: (data: Partial<User>) => void;
  setUserHash: (data: User) => void;
  clearUser: () => void;
};

const useCurrentUser = create(
  persist(
    (set) => ({
      user: null,
      userhash: null,
      username: null,
      profile: null,
      setUser: (data: User) =>
        set({ user: data, username: data.username, profile: data.profile }),
      updateUser: (data: Partial<User>) =>
        set(({ user }) => ({ user: user ? { ...user, ...data } : null })),
      setUserHash: (data: User) =>
        set({ userhash: encodeObject(data, 1000 * 60 * 60 * 6), user: data }),
      clearUser: () => set({ user: null, userhash: null }),
    }),
    {
      name: "UserStorage",
      partialize: (state: UserStore) => ({
        userhash: state.userhash,
        username: state.username,
        profile: state.profile,
      }),
    }
  )
);

export default useCurrentUser;
