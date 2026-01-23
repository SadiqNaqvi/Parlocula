import { oneDay, oneHour, queryLimit } from "@lib/constants";
import { getUpstashRedis, handleParsing, handlePipelineResponse, redisAggregator, RedisJson, RedisStage, Stage } from "@lib/providers/redis";
import { createArray, getTimeInFuture } from "@lib/utils";
import { Message, Participant } from "@model";
import { CachedFullRoomType, CachedParticipantType, FullRoomType, MereMessage, MereRoomType, MereUser, ParticipantEnumType, ParticipantType, RoomListResponse } from "@type/internal";
import { MessageModelType, ParticipantModelType, RoomModelType } from "@type/models";
import { Pipeline, ScoreMember } from "@upstash/redis";
import { ChainableCommander } from "ioredis";
import { ClientSession } from "mongoose";

/*
* rooms:{user_id} -zrevrange - ex 1d
* rooms:{user_id}:total - get - ex 1d
* room:{room_id} - get - ex 1d
* room:{room_id}:participants - lrange - ex never
* room:{room_id}:participants:total - number - ex never
* room:{room_id}:participant:{user_id} - hgetall - ex never
* room:{room_id}:messages - zadd - ex 1d
* room:{room_id}:messages:total - get - ex 1d
* message:{message_id} - get - ex 1d
* user:{user_id} - get - ex never
* user:{user_id}:invitations - sorted set - ex 1d
* user:{user_id}:invitations:total - get - ex 1d
*/

type ItemParamForSortedSet = { value: any, score: number };

// Helper functions for multiple use

const addRoomsInList = async ({ items, user_id, pipeline, total }: { pipeline?: Pipeline, user_id: string, items: ScoreMember<any>[], total?: number }) => {
    const transaction = pipeline ?? (await getUpstashRedis()).multi();

    const [first, ...rest] = items;
    transaction.zadd(`rooms:${user_id}`, first, ...rest);
    transaction.zremrangebyrank(`rooms:${user_id}`, 0, -(queryLimit * 2));
    transaction.incrby(`rooms:${user_id}:total`, total || items.length);
    transaction.expire(`rooms:${user_id}`, oneDay, "NX");
    transaction.expire(`rooms:${user_id}:total`, oneDay, "NX");

    if (pipeline) return pipeline;
    return await transaction.exec().then(handlePipelineResponse);
}

export const removeRoomFromList = async (user_id: string, rmid: string, pipeline?: Pipeline) => {
    const transaction = pipeline ?? (await getUpstashRedis()).multi();

    transaction.zrem(`rooms:${user_id}`, rmid);
    transaction.decr(`rooms:${user_id}:total`);

    if (pipeline) return pipeline;
    return await transaction.exec().then(handlePipelineResponse);
}

const addMessageInList = async ({ items, room_id, total, pipeline }: { pipeline?: Pipeline<[]>, room_id: string, items: ScoreMember<any>[], total?: number }) => {
    const transaction = pipeline ?? (await getUpstashRedis()).multi();

    const [first, ...rest] = items;
    transaction.zadd(`room:${room_id}:messages`, first, ...rest);
    transaction.zremrangebyrank(`room:${room_id}:messages`, 0, -(queryLimit * 5));
    transaction.incrby(`room:${room_id}:messages:total`, total || items.length);
    transaction.expire(`room:${room_id}:messages`, oneDay);
    transaction.expire(`room:${room_id}:messages:total`, oneDay);

    if (pipeline) return pipeline;
    return await transaction.exec().then(handlePipelineResponse);
}

const addInvitationInList = async ({ items, pipeline, user_id, total }: { pipeline?: Pipeline, user_id: string, items: ScoreMember<any>[], total?: number }) => {

    const transaction = pipeline ?? (await getUpstashRedis()).multi();

    const [first, ...rest] = items;
    transaction.zadd(`user:${user_id}:invitations`, first, ...rest);
    transaction.zremrangebyrank(`user:${user_id}:invitations`, 0, -queryLimit);
    transaction.incrby(`user:${user_id}:invitations:total`, total || items.length);
    transaction.expire(`user:${user_id}:invitations`, oneDay, "NX");
    transaction.expire(`user:${user_id}:invitations:total`, oneDay, "NX");

    if (pipeline) return pipeline;
    return await transaction.exec().then(handlePipelineResponse);
}

const removeInvitationFromList = async (uid: string, rmid: string, pipeline?: Pipeline) => {
    const transaction = pipeline ?? (await getUpstashRedis()).multi();

    transaction.zrem(`user:${uid}:invitations`, rmid);
    transaction.decr(`user:${uid}:invitations:total`);

    if (pipeline) return pipeline;
    return await transaction.exec().then(handlePipelineResponse);
}

const pushParticipantInList = async (room_id: string, items: { uid: string, type: ParticipantEnumType }[], pipeline?: Pipeline) => {

    const transaction = pipeline ?? (await getUpstashRedis()).multi();

    // Making sure that participant type also get updated in the list if participant when user accept invitation
    items.forEach(item => {
        // This will only happen when a user accept invitation and join a room, before that they will be invitee
        if (item.type === "participant") {
            transaction.srem(`room:${room_id}:participants`, `${item.uid}-invitee`);
            transaction.sadd(`room:${room_id}:participants`, `${item.uid}-participant`);
            transaction.incr(`room:${room_id}:participants:total`);
        }
        else {
            transaction.sadd(`room:${room_id}:participants`, `${item.uid}-${item.type}`);
        }
    });


    if (pipeline) return pipeline;
    return await transaction.exec().then(handlePipelineResponse);
}

export const getParticipantsOfRoom = async (room_id: string): Promise<{ uid: string, type: ParticipantEnumType }[]> => {
    const redis = await getUpstashRedis();

    const participants = await redis.smembers(`room:${room_id}:participants`);

    return participants.map(p => {
        const [uid, type] = p.split('-') as [string, ParticipantEnumType]
        return { uid, type }
    });
}

export const checkIfParticipantExists = async (room_id: string, user_id: string) => {
    const redis = await getUpstashRedis();
    return Boolean(await redis.exists(`room:${room_id}:participant:${user_id}`));
}

export const getParticipant = async (room_id: string, user_id: string, pipeline?: Pipeline) => {
    return (pipeline ?? await getUpstashRedis()).hgetall(`participant:room-${room_id}:user-${user_id}`) as unknown as CachedParticipantType;
}

export const storeParticipantInCache = async (room_id: string, user_id: string, participant: Partial<CachedParticipantType>, pipeline?: Pipeline) => {

    return (pipeline ?? await getUpstashRedis()).hset(`room:${room_id}:participant:${user_id}`, participant);
}

const removeParticipant = async (room_id: string, user_id: string, type: ParticipantEnumType | "unknown", pipeline?: Pipeline) => {

    const transaction = pipeline ?? (await getUpstashRedis()).multi();

    transaction.hdel(`room:${room_id}:participant:${user_id}`);
    if (type === "unknown") {
        transaction.srem(`room:${room_id}:participants`, `${user_id}-creator`);
        transaction.srem(`room:${room_id}:participants`, `${user_id}-invitee`);
        transaction.srem(`room:${room_id}:participants`, `${user_id}-participant`);
    }
    else transaction.srem(`room:${room_id}:participants`, `${user_id}-${type}`);

    if (pipeline) return pipeline;
    return await transaction.exec().then(handlePipelineResponse);
}

export const getUserMetaFromCache = async (user_id: string, pipeline?: Pipeline) => {
    return (pipeline ?? await getUpstashRedis()).hgetall(`user:${user_id}`);
}

export const storeUserMetaInCache = async (user: MereUser) => {
    const redis = await getUpstashRedis();
    const dataToStore = Object.entries(user)
        .filter(([k, v]) => Boolean(v))
        .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {})
    await redis.hset(`user:${user._id}`, dataToStore);
}

const removeRoomFromCache = async (rmid: string, pipeline?: Pipeline) => {
    const transaction = pipeline ?? (await getUpstashRedis()).multi();
    const participants = await getParticipantsOfRoom(rmid);

    participants.forEach(({ uid, type }) => {
        removeParticipant(rmid, uid, type);
        removeInvitationFromList(uid, rmid, transaction);
        removeRoomFromList(uid, rmid, transaction);
    });

    transaction.del(`room:${rmid}:participants`);
    transaction.del(`room:${rmid}`);

    if (pipeline) return pipeline;
    return await transaction.exec().then(handlePipelineResponse);
}



// Main functions 

export const getParticipantsFromCache = async (rmid: string) => {
    const redis = await getUpstashRedis();
    const [total, participants] = await Promise.all([
        redis.get(`room:${rmid}:participants:total`) as Promise<number>,
        getParticipantsOfRoom(rmid)
    ]);

    const pipeline = redis.multi();

    participants.forEach(({ uid }) => getUserMetaFromCache(uid, pipeline));

    return {
        data: await pipeline.exec().then(handlePipelineResponse),
        total: typeof total === "number" ? total : parseInt(total || "0") || participants.length,
    }

}

export const addParticipantInRoom = async (uid: string, rmid: string) => {
    const redis = await getUpstashRedis();
    const pipeline = redis.multi();
    storeParticipantInCache(rmid, uid, { participantType: "participant", seenAt: Date.now(), lastSync: Date.now() }, pipeline);

    // Remove updating participant type in room participant list
    pipeline.srem(`room:${rmid}:participants`, `${uid}-invitee`);
    pipeline.sadd(`room:${rmid}:participants`, `${uid}-participant`);

    removeInvitationFromList(uid, rmid, pipeline);
    addRoomsInList({
        pipeline,
        user_id: uid,
        items: [{ score: Date.now(), member: rmid }]
    });
    await pipeline.exec().then(handlePipelineResponse);
}

export const addInvitedParticipants = async (rmid: string, participants: string[]) => {
    const redis = await getUpstashRedis();
    const pipeline = redis.multi();

    pushParticipantInList(
        rmid,
        participants.map(uid => ({ uid, type: "invitee" })),
        pipeline,
    );

    participants.forEach(participant => {
        storeParticipantInCache(rmid, participant, { participantType: "invitee", seenAt: Date.now(), lastSync: Date.now() }, pipeline);
        addInvitationInList({
            user_id: participant,
            pipeline,
            items: [{ score: Date.now(), member: rmid }]
        });
    });

    const total = await Participant.countDocuments({ room_id: rmid, type: { $ne: "participant" } });

    pipeline.set(`room:${rmid}:participants:total`, total);

    await pipeline.exec().then(handlePipelineResponse);
}

export const removeRoomFromInvitation = async (uid: string, rmid: string, removeRoom: boolean, pipeline?: Pipeline) => {
    const transaction = pipeline ?? (await getUpstashRedis()).multi();
    removeParticipant(rmid, uid, "unknown", transaction);
    removeInvitationFromList(uid, rmid, transaction);

    if (removeRoom) await removeRoomFromCache(rmid, transaction);

    if (pipeline) return pipeline;

    await transaction.exec().then(handlePipelineResponse);
}

export const removeParticipantsFromCache = async (rmid: string, participants: string[]) => {
    const pipeline = (await getUpstashRedis()).multi();

    participants.forEach(uid => {
        removeParticipant(rmid, uid, "unknown", pipeline);
        removeRoomFromInvitation(uid, rmid, false, pipeline);
        removeRoomFromList(uid, rmid, pipeline);
    });

    const total = await Participant.countDocuments({ room_id: rmid, type: { $ne: "participant" } });

    pipeline.set(`room:${rmid}:participants:total`, total);

    await pipeline.exec().then(handlePipelineResponse)
}

const createPipelineForRoomList = (user_id: string, page: number, invitation?: boolean) => {

    const key = Boolean(invitation) ? `user:${user_id}:invitations` : `rooms:${user_id}`;

    const start = Boolean(invitation) ? 0 : page * queryLimit
    const end = start + queryLimit - 1;

    const stage: Stage<{ data: MereRoomType[], total: number }>[] = [
        { method: "zrevrange", key, ref: "roomList", options: [start, end] },
        { method: "get", key: `${key}:total`, ref: "totalRooms" },
        { method: "execute" },
        {
            method: "condition", ref: "roomList",
            validate: (s, roomList: string[] | undefined) => {
                const total = parseInt(s.get("totalRooms") as string);
                return Boolean(roomList && roomList.length !== 0 && total && !isNaN(total))
            }
        },
        {
            method: "lookup", ref: "roomList", explore: (_, roomList: string[]) => {
                return roomList.map(room_id => ({ method: "json.get", key: `room:${room_id}`, options: ["root", `room:${room_id}`] }))
            }
        },
        {
            method: "lookup", ref: "roomList", explore: (_, roomList: string[] | undefined) => {
                if (!roomList) throw Error();
                return roomList.map(room_id => ({ method: "smembers", key: `room:${room_id}:participants` }))
            }
        },
        { method: "execute" },
        {
            method: "condition", ref: "roomList", validate: (s, roomList: string[]) => {
                const rooms = roomList.map(room_id => s.has(`room:${room_id}`)).filter(Boolean);
                return rooms.length === roomList.length;
            }
        },
        {
            method: "transform", ref: "roomList", transform: (s, roomList: string[]) => {
                return roomList.map(rmid => {
                    const key = `room:${rmid}`;
                    const room: any[] = handleParsing(s.get(key));
                    if (!room || !room[0]) throw new Error(`Aggregation failed at transform stage due to lack of data of key ${key}`);
                    return { key, value: room[0] }
                })
            }
        },
        {
            method: "lookup", ref: "roomList", explore: (_, roomList: string[] | undefined) => {
                if (!roomList) throw Error();
                return roomList.map(room_id => ({ method: "hgetall", key: `room:${room_id}:participant:${user_id}` }))
            }
        },
        {
            method: "addField", field: "otherParticipantMap", val: (store) => {

                // Add a record field in the store for faster lookup of other participant id
                const roomList = store.get("roomList") as string[];
                const roomToOtherParticipantMap: Record<string, string> = {};
                roomList.forEach(room_id => {
                    const participants = store.get(`room:${room_id}:participants`) as string[]
                    const room = store.get(`room:${room_id}`) as CachedFullRoomType;

                    const otherParticipant_id = room.type === "private" && participants.filter(uid => uid.split('-')[0] !== user_id).at(0);
                    if (otherParticipant_id) roomToOtherParticipantMap[room_id] = otherParticipant_id;
                });
                return roomToOtherParticipantMap;
            }
        },
        {
            method: "lookup", ref: "otherParticipantMap", explore: (_, otherParticipantMap: Record<string, string>) => {
                return Object.entries(otherParticipantMap).map(([room_id, user_id]) =>
                    ({ method: "hgetall", key: `room:${room_id}:participant:${user_id}` })
                );
            }
        },
        {
            method: "lookup", ref: "otherParticipantMap", explore: (_, otherParticipantMap: Record<string, string>) => {
                return Object.values(otherParticipantMap).map(user_id =>
                    ({ method: "hgetall", key: `user:${user_id}` })
                );
            }
        },
        { method: "execute" },
        {
            method: "return", value: (store) => {
                const roomList = store.get("roomList") as string[];
                const total = parseInt(store.get("totalRooms") as string);
                const otherParticipantMap = store.get("otherParticipantMap") as Record<string, string>

                const data = roomList.map(room_id => {

                    const { invitationMessage, lastMessage, lastMessageAt, lastMessageBy, name, poster, type, createdAt } = store.get(`room:${room_id}`) as CachedFullRoomType;

                    const { mute, participantType, seenAt, hideAt } = store.get(`room:${room_id}:participant:${user_id}`) as ParticipantType;

                    if (new Date(lastMessageAt) < new Date(hideAt)) return null;

                    const otherParticipant_id = otherParticipantMap[room_id] as string | undefined;
                    const otherParticipantData = otherParticipant_id ? store.get(`room:${room_id}:participant:${otherParticipant_id}`) as ParticipantType : undefined;
                    const otherParticipantMetaData = otherParticipant_id ? store.get(`user:${otherParticipant_id}`) as MereUser : undefined;

                    if (type === "private" && !(otherParticipantMetaData || otherParticipantMetaData))
                        throw new Error("Participant data missing");

                    return {
                        display_name: (type === "private" ? otherParticipantMetaData?.username : name) || "Not found",
                        poster: type === "private" ? otherParticipantMetaData?.profile : poster,
                        type: participantType,
                        room_type: type,
                        otherParticipant_seenAt: otherParticipantData?.seenAt,
                        room_id, invitationMessage, lastMessage, lastMessageAt, lastMessageBy, mute, otherParticipant_id, seenAt, createdAt
                    }
                }).filter(Boolean) as MereRoomType[];

                return { data, total }
            }
        }
    ];
    return stage;

}

export const getRoomListFromCache = async (user_id: string, page: number): Promise<{ data: MereRoomType[], total: number } | null> => {
    try {
        return await redisAggregator(createPipelineForRoomList(user_id, page));
    } catch (e: any) {
        console.error("Error occured while getting room list form cache", e.message);
        return null;
    }
};

export const getInvitationListFromCache = async (user_id: string): Promise<{ data: MereRoomType[], total: number } | null> => {
    try {
        return await redisAggregator(createPipelineForRoomList(user_id, 0, true));
    } catch (e: any) {
        console.error("Error occured while getting invitation list from cache", e.message);
        return null;
    }
};

export const storeInvitationInCache = async (user_id: string, list: { data: RoomListResponse[], total: number }) => {

    console.log("Storing Invitation List");

    const redis = await getUpstashRedis();

    const pipeline = redis.multi();

    addInvitationInList({
        pipeline,
        user_id,
        items: list.data.map(room => ({
            score: new Date(room.lastMessageAt).getTime(),
            member: room.room_id.toString(),
        })),
        total: list.total
    });

    list.data.forEach(room => {
        const { room_id, display_name, invitationMessage, lastMessage, lastMessageAt, lastMessageBy, otherParticipant_id, poster, room_type, createdAt } = room;

        redis.set(`room:${room_id}`, {
            type: room_type, invitationMessage, lastMessage, lastMessageAt, lastMessageBy,
            name: display_name, poster,
            participants: otherParticipant_id ? [user_id, otherParticipant_id] : [],
            createdAt
        } as CachedFullRoomType);
    });

    await pipeline.exec().then(handlePipelineResponse);
};

export const storeRoomList = async (user_id: string, data: RoomListResponse[], total: number) => {

    console.log("Storing Room list");

    const redis = await getUpstashRedis();

    const pipeline = redis.multi();

    addRoomsInList({
        pipeline,
        user_id,
        items: data.map(room => ({
            score: new Date(room.lastMessageAt).getTime(),
            member: room.room_id.toString(),
        })), total
    });

    data.forEach(room => {
        const { room_id, display_name, invitationMessage, lastMessage, lastMessageAt, lastMessageBy, otherParticipant_id, poster, room_type, createdAt } = room;

        redis.set(`room:${room_id}`, {
            type: room_type, invitationMessage, lastMessage, lastMessageAt, lastMessageBy,
            name: display_name, poster,
            participants: otherParticipant_id ? [user_id, otherParticipant_id] : [],
            createdAt
        } as CachedFullRoomType);
    });

    await pipeline.exec().then(handlePipelineResponse);
}

export const getRoomDetails = async (room_id: string, user_id: string): Promise<FullRoomType | null> => {
    try {
        const redis = await getUpstashRedis();
        const getPipeline = redis.multi();
        getPipeline.get(`room:${room_id}`);
        getPipeline.smembers(`room:${room_id}:participants`);
        const [room, participants] = await getPipeline.exec().then(handlePipelineResponse) as [CachedFullRoomType, string[]];

        if (!room) return null;

        const { invitationMessage, lastMessage, lastMessageAt, lastMessageBy, name, poster, type, createdAt } = room;

        const otherParticipant_id = type === "private" ? participants.filter(uid => uid.split('-')[0] !== user_id).at(0) : undefined;

        return await redisAggregator<FullRoomType>([
            { method: "hgetall", key: `room:${room_id}:participant:${user_id}`, ref: "currentUser" },
            { method: "get", key: `room:${room_id}:participants:total`, ref: "total" },
            { method: "condition", ref: "currentUser", validate: (_, val) => Boolean(val) },

            ...createArray<RedisStage>([])
                .concatConditionally(otherParticipant_id, (uid) => ({ method: "hgetall", key: `room:${room_id}:participant:${uid}`, ref: "otherParticipantData" }))
                .concatConditionally(otherParticipant_id, (uid) => ({ method: "hgetall", key: `user:${uid}`, ref: "otherParticipantMeta" })),

            { method: "execute" },
            {
                method: "return", value: (store) => {
                    const participantData = store.get("otherParticipantData") as ParticipantType | undefined;
                    const participantMeta = store.get("otherParticipantMeta") as MereUser;
                    const { mute, participantType, seenAt } = store.get("currentUser") as ParticipantType;
                    const total = parseInt(store.get("total") as string || "0") || 0;
                    return {
                        _id: room_id,
                        display_name: (type === "private" ? participantMeta.username : name) || "Not Found",
                        poster: type === "private" ? participantMeta.profile : poster,
                        lastMessage, lastMessageAt, lastMessageBy, mute, participantType, seenAt, type, invitationMessage,
                        otherParticipant_id,
                        otherParticipant_seenAt: participantData?.seenAt,
                        createdAt,
                        participant_count: total
                    }
                }
            }
        ]);
    } catch (e: any) {
        console.log("Error occured while fetching room details from cache:", e.message);
        return null;
    }
}

export const setRoomDetail = async (room_id: string, room: Partial<CachedFullRoomType>, isUpdating: boolean, pipeline?: any) => {

    const redis = pipeline ?? (await getUpstashRedis()).multi();
    const instance = RedisJson(redis);
    if (isUpdating) instance.objUpdateMulti(`room:${room_id}`, room);
    // if (isUpdating) instance.set(`room:${room_id}`, room);
    else instance.set("root", `room:${room_id}`, room);

    if (!pipeline) await redis.exec().then(handlePipelineResponse);

}

const updateLastMessageFieldsOfRoom = async (room_id: string, message: MessageModelType) => {
    const redis = await getUpstashRedis();
    const participants = await redis.smembers(`room:${room_id}:participants`);

    const pipeline = redis.multi();

    const time = new Date(message.createdAt).getTime();

    const update = {
        lastMessage: message.content,
        lastMessageAt: time,
        lastMessageBy: message.user_id.toString()
    };

    await redis.json.merge(`room:${room_id}`, '$', update);

    // setRoomDetail(`room:${room_id}`, update, true, pipeline);

    participants.forEach(participant => {
        const [uid] = participant.split('-');
        pipeline.zadd(`rooms:${uid}`, { score: time, member: room_id });

    });

    await pipeline.exec().then(handlePipelineResponse);
}

export const setDataWhileCreatingRoom = async (room: RoomModelType & { _id: string }, creator: string, participants: ParticipantModelType[]) => {
    try {
        const redis = await getUpstashRedis();
        const room_id = room._id;

        const pipeline = redis.pipeline();

        const itemsForSortedSet = [{ member: room_id, score: new Date(room.lastMessageAt).getTime() }];

        // 1. Add Room in room list of the creator
        addRoomsInList({ user_id: creator, items: itemsForSortedSet, pipeline });

        // 2. Create a participant list with all the invited participants + creator.
        pushParticipantInList(room_id, participants.map(p => ({ uid: String(p.user_id), type: "invitee" })), pipeline);
        pushParticipantInList(room_id, [{ uid: creator, type: "creator" }], pipeline);

        // 3. Store the room metadata seperately
        setRoomDetail(room_id, {
            invitationMessage: { ...room.invitationMessage, user_id: creator },
            lastMessageBy: creator,
            lastMessage: room.lastMessage,
            lastMessageAt: room.lastMessageAt,
            type: room.type,
            name: room.name || "Unavailable",
            poster: room.poster,
        }, false, pipeline);

        // 4. Store participant metadata seperately
        // 5. Add room in the invitation list of each participant except creator
        participants.forEach(participant => {
            const { hideAt, mute, seenAt, type } = participant;
            const user_id = participant.user_id.toString();

            storeParticipantInCache(room_id, user_id, { participantType: type, seenAt, mute, hideAt }, pipeline);
            if (user_id !== creator) addInvitationInList({ pipeline, user_id, items: itemsForSortedSet });
        });

        await pipeline.exec().then(handlePipelineResponse);
    } catch (error: any) {
        console.log("Error at redis while creating room", error);
        throw new Error(error);
    }
}

type MessageItem = { msg_id: string, createdAt: number };

export const getMessagesFromCache = async (room_id: string, user_id: string, page: number) => {
    try {
        const redis = await getUpstashRedis();
        const pipeline = redis.multi();

        const start = page * queryLimit;
        const end = start + queryLimit - 1;

        pipeline.zrange(`room:${room_id}:messages`, start, end);
        pipeline.get(`room:${room_id}:messages:total`);
        getParticipant(room_id, user_id, pipeline);

        const [messageIds, total, participant] = await pipeline.exec().then(handlePipelineResponse) as [MessageItem[], number, CachedParticipantType];

        if (!messageIds.length || !participant) return null;

        const messages = await redis
            .mget<MessageModelType[]>(messageIds.map(({ msg_id }) => `message:${msg_id}`))
            .then(msgs => msgs
                .map(msg => {
                    // const message = JSON.parse(msg ?? "null") as MessageModelType | null;
                    const message = msg;
                    if (!message || new Date(message.createdAt).getTime() < new Date(participant.hideAt).getTime())
                        return;
                    return message;
                })
                .filter(Boolean)
            )

        return { data: messages, total }

    } catch (err: any) {
        console.error("Error occured while getting messages from cache", err.message);
        return null;
    }
}

export const storeMessagesInCache = async (room_id: string, data: MereMessage[], total: number) => {
    try {
        const redis = await getUpstashRedis();
        const pipeline = redis.multi();

        addMessageInList({
            pipeline,
            room_id,
            items: data.map(msg => ({
                score: new Date(msg.createdAt).getTime(),
                // member: JSON.stringify({ msg_id: msg._id, createdAt: msg.createdAt })
                member: { msg_id: msg._id, createdAt: msg.createdAt }
            })),
            total
        });

        await pipeline.exec().then(handlePipelineResponse);

    } catch (err: any) {
        console.log(`Error occured while storing messages in cache: ${err.message}`)
    }
}

const checkIfTimeToSyncMessageBuffer = async (room_id: string) => {
    console.log("Checking if time to sync")
    try {
        const redis = await getUpstashRedis();
        const pipeline = redis.multi();
        pipeline.llen(`room:${room_id}:messageBuffer`);
        pipeline.lrange(`room:${room_id}:messageBuffer`, 0, 1);

        const [length, firstMessage] = await pipeline.exec().then(handlePipelineResponse) as [number, MessageItem];

        return Boolean(length >= queryLimit || firstMessage.createdAt > getTimeInFuture({ unit: 'm' }))
    } catch (e: any) {
        console.error("Error occured while checking if time to sync message buffer", e.message);
        return false;
    }
}

const syncMessageBuffer = async (room_id: string, session: ClientSession, message?: MessageModelType) => {
    console.log("Syncing message buffer");

    const redis = await getUpstashRedis();

    // const messageids: MessageItem[] = (await redis.lrange(`room:${room_id}:messageBuffer`, 0, -1)).map(r => JSON.parse(r));
    const messageids = await redis.lrange<MessageItem>(`room:${room_id}:messageBuffer`, 0, -1);

    // const messageBuffer: MessageModelType[] = (await redis.mget(messageids.map(({ msg_id }) => `message:${msg_id}`))).filter(el => el !== null).map(el => JSON.parse(el))
    const messageBuffer = (await redis.mget<MessageModelType[]>(messageids.map(({ msg_id }) => `message:${msg_id}`))).filter(el => el !== null)

    const messagesToStore = createArray(messageBuffer)
        .concatConditionally(message, (msg) => msg)
        .map(r => ({
            ...r,
            replied_content: r.replied_content || undefined,
            replied_to: r.replied_to || undefined,
        }))

    const messages = await Message.create(messagesToStore, { session, ordered: true });
    if (messages.length === messagesToStore.length) {
        await redis.del(`room:${room_id}:messageBuffer`);
        return true;
    }
    return false;
}

const storeNewMessageInBuffer = async (room_id: string, message: MessageModelType) => {
    console.log("Stroing new message in buffer");

    const redis = await getUpstashRedis();
    await redis.lpush(
        `room:${room_id}:messageBuffer`,
        //  JSON.stringify({ msg_id: message._id, createdAt: message.createdAt })
        { msg_id: message._id, createdAt: message.createdAt }
    );
}

const storeNewMessageInList = async (room_id: string, message: MessageModelType) => {
    console.log("Storing new mesage in list");
    const redis = await getUpstashRedis();
    const pipeline = redis.multi();

    console.log("starting to add message in list");
    addMessageInList({
        pipeline,
        room_id,
        items: [{
            score: new Date(message.createdAt).getTime(),
            // member: JSON.stringify({ msg_id: message._id, createdAt: message.createdAt })
            member: { msg_id: message._id, createdAt: message.createdAt }
        }]
    });

    // pipeline.setex(`message:${message._id}`, oneDay, JSON.stringify(message));
    pipeline.setex(`message:${message._id}`, oneDay, message);

    console.log("updating last message fields");
    await updateLastMessageFieldsOfRoom(room_id, message);
    console.log("done updating last message fields");

    await pipeline.exec().then(handlePipelineResponse);
}

export const handleNewMessage = async (room_id: string, user_id: string, message: MessageModelType, session: ClientSession) => {
    if (await checkIfTimeToSyncMessageBuffer(room_id)) await syncMessageBuffer(room_id, session, message);
    else await storeNewMessageInBuffer(room_id, message);

    await storeNewMessageInList(room_id, message);
}

export const updateParticipantSeenAt = async (rmid: string, uid: string) => {

    const participant = await getParticipant(rmid, uid);

    if (!participant) return false;

    const now = Date.now()

    const isTimeToSync = Boolean(!participant.lastSync || (new Date(participant.lastSync).getTime() + oneHour) < Date.now());
    if (isTimeToSync) {
        await Participant.findOneAndUpdate(
            { room_id: rmid, user_id: uid },
            { seenAt: now }
        );
    }

    await storeParticipantInCache(rmid, uid, {
        ...participant,
        seenAt: now,
        ...(isTimeToSync && { lastSync: now })
    });

    return true;
}

export const updateRoomNotification = async (rmid: string, uid: string, state: boolean) => {

    const participant = await getParticipant(rmid, uid);

    if (!participant) return false;

    await storeParticipantInCache(rmid, uid, {
        ...participant,
        mute: state,
    });

    return true;
}

export const hideRoomInCache = async (rmid: string, uid: string) => {

    const participant = await getParticipant(rmid, uid);

    if (!participant) return false;

    const pipeline = (await getUpstashRedis()).multi();

    await storeParticipantInCache(rmid, uid, {
        ...participant,
        hideAt: Date.now(),
    }, pipeline);

    removeRoomFromList(uid, rmid, pipeline);

    pipeline.exec();

    return true;
}