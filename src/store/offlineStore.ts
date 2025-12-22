import { useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type OfflineStoreType<T = any> = {
    store: Record<string, T>;
    setter: (key: string, val: T) => void;
    getter: (key: string) => T | undefined;
    clear: () => void
};

export const offlineStore = create(persist<OfflineStoreType>(
    (set, get) => ({
        store: {},
        setter: (key, val) => {
            set((state) => ({
                store: {
                    ...state.store,
                    [key]: val,
                },
            }));
        },
        getter: (key) => get().store[key],
        clear: () => set({ store: {} }),
    }),
    {
        name: "OfflineStorage",
    }
));

export const useOfflineStore = <T>(
    key: string | string[],
    initial: T
): [T, (v: T) => void] => {

    const { setter, getter } = offlineStore.getState();

    const stringKey = Array.isArray(key) ? key.join(":") : key;

    useEffect(() => {
        if (getter(stringKey) === undefined) setter(stringKey, initial);
    }, [key, getter, setter]);

    const state = offlineStore((state) => state.store[stringKey]);

    const set = (val: T) => setter(stringKey, val);

    return [state, set];
};

export default useOfflineStore;