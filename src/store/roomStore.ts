import { MereRoomType } from "@type/internal";
import { create } from "zustand";

type RoomStoreType = {
    room: Record<string, MereRoomType>,
    isFilled: boolean,
    setRooms: (rooms: MereRoomType[]) => string[],
    updateRoom: (update: Partial<MereRoomType>, room_id: string) => void;
}

const useRoomStore = create<RoomStoreType>((set, get) => ({
    room: {},
    isFilled: false,
    setRooms: (rooms) => {
        const ids: string[] = [];
        const store = get().room;
        rooms.forEach(room => {
            const data = store[room.room_id];
            if (data) {
                store[room.room_id] = { ...(data || {}), ...room }
            } else {
                store[room.room_id] = room;
            }
            ids.push(room.room_id);
        });

        set(state => ({ ...state, room: store, isFilled: true }))

        return ids;
    },
    updateRoom: (update, room_id) => {

        const roomToUpdate = get().room[room_id];

        if (!roomToUpdate) return;

        set(state => ({
            ...state,
            room: {
                ...state.room,
                [room_id]: { ...roomToUpdate, ...update }
            }
        }))
    }
}));

export default useRoomStore;