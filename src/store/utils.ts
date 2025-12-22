import localforage from "localforage";

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