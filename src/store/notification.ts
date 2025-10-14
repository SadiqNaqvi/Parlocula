import { create } from "zustand";
import { persist } from "zustand/middleware";
import { localForageStorage } from "./user";

type NotificationStoreType = {
  last: string | null;
  isHydrated: boolean;
  newNotification: boolean;
  checkNewNotification: (n: { _id: string } | null | undefined) => void;
};

const useNotification = create(
  persist(
    (set, get) => ({
      isHydrated: false,
      last: null,
      newNotification: false,
      checkNewNotification: (n) => {
        if (!n) return;
        const { last } = get();
        if (!last || last !== n._id)
          set({ newNotification: true, last: n._id });
      },
    }),
    {
      name: "NStorage",
      storage: localForageStorage,
      onRehydrateStorage: () => (state) => {
        if (state)
          setTimeout(() => {
            useNotification.setState({ isHydrated: true });
          }, 0);
      },
      partialize: (state: NotificationStoreType) =>
        ({
          last: state.last,
        }) as Partial<NotificationStoreType>,
    }
  )
);

export default useNotification;
