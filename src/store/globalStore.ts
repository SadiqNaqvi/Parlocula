"use client";
import { useEffect } from "react";
import { create } from "zustand";

type GlobalStoreType<T = any> = {
  store: Record<string, T>;
  setter: (key: string, val: T) => void;
  getter: (key: string) => T | undefined;
};

export const globalStore = create<GlobalStoreType>((set, get) => ({
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
}));

export const useGlobalStore = <T>(
  key: string,
  initial?: T
): [T, (v: T) => void] => {

  const { setter, getter } = globalStore.getState();

  useEffect(() => {
    if (getter(key) === undefined) setter(key, initial);
  }, [key, getter, setter, initial]);

  const state = globalStore((state) => state.store[key]);

  const set = (val: T) => setter(key, val);

  return [state, set];
};

export default useGlobalStore;
