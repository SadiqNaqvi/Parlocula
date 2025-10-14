import { oneDay } from "@lib/constants";
import { acceptRoomInvitation, createRoom, rejectRoomInvitation, sendMessage, unsendMessage, updateParticipantSeenAt } from "@lib/helpers/client";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys } from "@lib/utils";
import { UserMetaData } from "@store/user";
import { useMutation } from "@tanstack/react-query";
import { FullRoomType, GenericDate, MereMessage, MereRoomType, MereUser, RoomEnumType } from "@type/internal";
import { InfiniteScrollerDataType } from "@type/other";
import { FrameDataSchemaType, MessageSchemaType } from "@type/schemas";

export const convertFullToMereRoom = (room: FullRoomType, message?: { content: string, user_id: string, createdAt: GenericDate }): MereRoomType => {
  const lastMessageAt = message?.createdAt ?? room.lastMessageAt
  return {
    display_name: room.display_name,
    mute: room.mute,
    otherParticipant_id: room.otherParticipant_id,
    lastMessage: message?.content ?? room.lastMessage,
    lastMessageBy: message?.user_id ?? room.lastMessageBy,
    lastMessageAt: new Date(lastMessageAt),
    otherParticipant_seenAt:
      room.type === "private"
        // Here it should be participant seent at instead of seen at
        ? room.seenAt
        : new Date(Date.now() - 1000 * oneDay),
    poster: room.poster,
    room_id: room._id,
    seenAt: room.seenAt,
    type: room.participantType,
  };
}

export const setOrRemoveRoom = ({
  rmid,
  uid,
  room,
  update
}: {
  rmid: string;
  uid: string;
  room: Partial<FullRoomType> | null;
  update?: boolean;
}) => {
  const qc = getQueryClient();
  const qkeys = getQueryKeys("room_rmid_uid", { rmid, uid });
  const roomKeys = getQueryKeys("rooms_uid", { uid });

  const roomPrevData = qc.getQueryData<FullRoomType>(qkeys);
  const roomsPrevData = qc.getQueryData(roomKeys);

  if (room === null) qc.removeQueries({ queryKey: qkeys });

  if (!roomPrevData) throw new Error("Room is undefined");

  if (update) {
    qc.setQueryData<FullRoomType>(qkeys, { ...roomPrevData, ...room })
    qc.setQueryData(roomKeys, (old: InfiniteScrollerDataType<MereRoomType>) => {
      if (!old) return old;

      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          results: page.results.map((result) =>
            result.room_id === rmid ? { ...result, ...room } : result
          ),
        })),
      }
    });
  } else qc.setQueryData<FullRoomType>(qkeys, room as FullRoomType);

  return { roomPrevData, roomsPrevData };
};

export const pushRoomIntoRoomList = ({
  rmid,
  room,
  uid,
}: {
  uid: string;
  rmid: string;
  room: MereRoomType;
}) => {
  const qc = getQueryClient();
  const roomsKey = getQueryKeys("rooms_uid", { uid });

  const roomsPrevData = qc.getQueryData(roomsKey);

  qc.setQueryData<InfiniteScrollerDataType<MereRoomType>>(roomsKey, (old) => {
    const oldData = old ?? {
      pageParams: [1],
      pages: [{ results: [], page: 1, total_pages: 1, total_results: 0 }],
    };

    const { pages } = oldData;

    if (pages[0].results[0]?.room_id === rmid) return oldData;

    const newPages = pages.map(page => ({
      ...page,
      results: page.results.filter(room => room.room_id !== rmid)
    }));

    const [firstPage, ...rest] = newPages;

    return {
      ...oldData,
      pages: [
        { ...firstPage, results: [room, ...firstPage.results], total_results: firstPage.total_results + 1 },
        ...rest,
      ],
    };

  });

  return { roomsPrevData };
};

export const removeRoomFromInvitationList = (rmid: string, uid: string) => {
  const qc = getQueryClient();
  const keys = getQueryKeys("roomInvitations_uid", { uid });

  const invitationPrevData = qc.getQueryData(keys);

  qc.setQueryData<InfiniteScrollerDataType<MereRoomType>>(keys, (old) => {
    if (!old) return old;

    const { pages } = old;

    return {
      ...old,
      pages: pages.map(page => ({
        ...page,
        results: page.results.filter(room => room.room_id !== rmid)
      }))
    };

  });

  return { invitationPrevData };
};

export const pushMessageIntoList = ({
  message,
  rmid,
  room,
  uid,
}: {
  rmid: string;
  uid: string;
  message: MereMessage;
  room: MereRoomType;
}) => {
  const qc = getQueryClient();
  const messageKey = getQueryKeys("messages_rmid", { rmid });

  qc.setQueryData<InfiniteScrollerDataType<MereMessage>>(messageKey, (old) => {
    const oldData = old ?? {
      pageParams: [1],
      pages: [{ results: [], page: 1, total_pages: 1, total_results: 0 }],
    };

    const { pages } = oldData;
    const [firstPage, ...restPages] = pages;

    const { total_results, results, ...rest } = firstPage;

    const newPages = [
      {
        results: [...results, message],
        total_results: total_results + 1,
        ...rest,
      },
      ...restPages,
    ];

    return { ...oldData, pages: newPages };
  });

  pushRoomIntoRoomList({ uid, rmid, room });
  setOrRemoveRoom({
    rmid, uid,
    update: true,
    room: {
      lastMessage: message.content,
      lastMessageAt: message.createdAt,
      lastMessageBy: message.user_id,
    },
  });

  return;
};

export const onRoomCreation = ({
  rmid,
  uid,
  room,
  message,
}: {
  rmid: string;
  uid: string;
  room: FullRoomType;
  message: MereMessage;
}) => {
  const { roomPrevData } = setOrRemoveRoom({ rmid, uid, room });

  const { roomsPrevData } = pushRoomIntoRoomList({
    rmid,
    room: convertFullToMereRoom(room, message),
    uid,
  });

  let roomExistPrevData: any = undefined;

  const queryClient = getQueryClient();

  if (room.type === "private" && room.otherParticipant_id) {
    const roomExistKey = getQueryKeys("roomExists_ruid_uid", { uid, ruid: room.otherParticipant_id })
    roomExistPrevData = queryClient.getQueryData(roomExistKey);
    queryClient.setQueryData(roomExistKey, { _id: room._id })
  }

  return { roomPrevData, roomsPrevData, roomExistPrevData };
};

export const updateMessageStatus = (msg_id: string, rmid: string, status: "sent" | "error" | "sending") => {
  const qc = getQueryClient();
  const messageKey = getQueryKeys("messages_rmid", { rmid });

  qc.setQueryData<InfiniteScrollerDataType<MereMessage>>(messageKey, (old) => {
    if (!old) return old;

    const { pages } = old;

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const page = pages[pageIndex];
      const msgIndex = page.results.findIndex((r) => r._id === msg_id);

      if (msgIndex !== -1) {
        // ✅ Rebuild only the affected page & message
        const newPage = {
          ...page,
          results: [
            ...page.results.slice(0, msgIndex),
            { ...page.results[msgIndex], status },
            ...page.results.slice(msgIndex + 1),
          ],
        };

        const newPages = [
          ...pages.slice(0, pageIndex),
          newPage,
          ...pages.slice(pageIndex + 1),
        ];

        return { ...old, pages: newPages };
      }
    }

    return old;
  });

  //   return {
  //     ...old,
  //     pages: old.pages.map((page) => ({
  //       ...page,
  //       results: page.results.map((result) =>
  //         result._id === msg_id ? { ...result, status } : result
  //       ),
  //     })),
  //   };
  // });
}

export const removeMessageFromClient = (msg_id: string, rmid: string) => {
  const qc = getQueryClient();

  const messageKey = getQueryKeys("messages_rmid", { rmid });

  const prevMsgList = qc.getQueryData(messageKey);

  qc.setQueryData<InfiniteScrollerDataType<MereMessage>>(messageKey, (old) => {
    if (!old) return old;

    const { pages } = old;

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const page = pages[pageIndex];
      const msgIndex = page.results.findIndex((r) => r._id === msg_id);

      if (msgIndex !== -1) {
        // ✅ Rebuild only the affected page & message
        const newPage = {
          ...page,
          results: page.results.slice(0, msgIndex).concat(
            page.results.slice(msgIndex + 1)
          ),
        };

        const newPages = [
          ...pages.slice(0, pageIndex),
          newPage,
          ...pages.slice(pageIndex + 1),
        ];

        return { ...old, pages: newPages };
      }
    }

    return old; // no message found
  });

  return { prevMsgList }

}

/*
qc.setQueryData<InfiniteScrollerDataType<MereMessage>>(messageKey, (old) => {
    if (!old) return old;

    const { pages } = old;

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const page = pages[pageIndex];
      const msgIndex = page.results.findIndex((r) => r._id === msg_id);

      if (msgIndex !== -1) {
        // ✅ Rebuild only the affected page & message
        const newPage = {
          ...page,
          results: [
            ...page.results.slice(0, msgIndex),
            { ...page.results[msgIndex], status },
            ...page.results.slice(msgIndex + 1),
          ],
        };

        const newPages = [
          ...pages.slice(0, pageIndex),
          newPage,
          ...pages.slice(pageIndex + 1),
        ];

        return { ...old, pages: newPages };
      }
    }

    return old; // no message found
  });
*/

/*
type OnMutateReturn = {
  [key: string]: any,
}

type PerformMutationProps<V = unknown, R = unknown, M = OnMutateReturn> = {
  mutation: (valriable: V) => Promise<R>,
  onMutate: (variable: V) => Promise<M> | M,
  onSuccess?: (options: { variable: V, context: M, data: R }) => void,
  onError?: (options: { error: Error, variable: V, context: M }) => void,
  variable: V,
}

const performMutation = async <T>({ mutation, onError, onMutate, onSuccess, variable }: PerformMutationProps<T>) => {
  const context = await onMutate(variable);
  await mutation(variable)
    .then(data => onSuccess?.({ variable, context, data }))
    .catch(error => onError?.({ error, variable, context }));
}

type Props = { rmid: string, uid: string, room: FullRoomType }
const lala = (config: Props) => {
  performMutation({
    mutation: ({ rmid, uid }: Props) => acceptRoomInvitation(uid, rmid),
    onMutate: ({ room, uid }) => {
      const { invitationPrevData, roomsPrevData } = onAcceptInvitation(room, uid);

      return { invitationPrevData, roomsPrevData }
    },
    variable: config,
  })

}
*/

export const onAcceptInvitation = (room: FullRoomType, uid: string) => {
  const { roomsPrevData } = pushRoomIntoRoomList({
    // message: { content: room.lastMessage, createdAt: room.lastMessageAt, user_id: room.lastMessageBy },
    rmid: room._id,
    room: convertFullToMereRoom(room),
    uid,
  });
  const { invitationPrevData } = removeRoomFromInvitationList(room._id, uid);

  setOrRemoveRoom({
    rmid: room._id,
    room: { participantType: "participant", users: [...room.users, uid] },
    uid,
    update: true
  });
  return { roomsPrevData, invitationPrevData }
};

export const useCreateRoomMutation = () => {
  type Props = {
    message: string,
    rmid: string,
    user: UserMetaData,
    ruid: string | undefined,
    room: {
      name: string,
      poster: string | undefined,
      participants: string[],
      type: RoomEnumType,
      files: File[],
      filesData: FrameDataSchemaType[]
    }
  };
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: ({ message, rmid, room, user }: Props) => {
      return createRoom(
        user.user_id,
        rmid,
        {
          inviteMessage: message,
          participants: room.participants,
          type: room.type,
          files: room.files,
          filesData: room.filesData,
          name: room.type === "group" ? room.name : undefined,
        })
    },
    onMutate: ({ message, rmid, room, user }: Props) => {

      const now = Date.now();

      const { name, poster, type } = room;

      const roomToAdd: FullRoomType = {
        _id: rmid,
        display_name: name,
        invitationMessage: {
          content: message,
          createdAt: now,
          user_id: user.user_id,
          username: user.username,
        },
        lastMessage: message,
        lastMessageAt: now,
        lastMessageBy: user.user_id,
        mute: false,
        otherParticipant_id: undefined,
        otherParticipant_seenAt: undefined,
        participantType: "creator",
        seenAt: now,
        type,
        users: [user.user_id],
        poster
      }

      const messageKey = getQueryKeys("messages_rmid", { rmid });

      queryClient.setQueryData(messageKey, {
        pageParams: [1],
        pages: [{ results: [], page: 1, total_pages: 1, total_results: 0 }],
      });

      return onRoomCreation({
        rmid,
        room: roomToAdd,
        uid: user.user_id,
        message: {
          _id: now.toString(64),
          content: message,
          createdAt: now,
          room_id: rmid,
          user_id: user.user_id,
          username: user.username,
          status: "sent",
          replied_content: undefined,
          replied_to: undefined,
        }
      });
    },
    onError: (e, v, c) => {
      if (e) throw new Error(e.message, { cause: e.cause });
      if (!c) return;

      const uid = v.user.user_id;
      const { roomExistPrevData, roomPrevData, roomsPrevData } = c;

      queryClient.setQueryData(getQueryKeys("room_rmid_uid", { rmid: v.rmid, uid }), roomPrevData);
      queryClient.setQueryData(getQueryKeys("rooms_uid", { uid }), roomsPrevData);
      if (roomExistPrevData && v.ruid) {
        queryClient.setQueryData(getQueryKeys("roomExists_ruid_uid", { ruid: v.ruid, uid }), roomExistPrevData);
      }
    }
  });
}

export const useAcceptInviteMutation = () => {
  type Props = { rmid: string, uid: string, room: FullRoomType }
  return useMutation({
    mutationFn: ({ rmid, uid }: Props) => acceptRoomInvitation(uid, rmid),
    onMutate: ({ room, uid }: Props) => {
      const { invitationPrevData, roomsPrevData } = onAcceptInvitation(room, uid);

      return { invitationPrevData, roomsPrevData }
    },
    onError: (e, v, c) => {
      console.log(e);
      const queryClient = getQueryClient();
      if (!c) return;

      const { uid } = v;

      queryClient.setQueryData(getQueryKeys("roomInvitations_uid", { uid }), c.invitationPrevData);
      queryClient.setQueryData(getQueryKeys("rooms_uid", { uid }), c.roomsPrevData);
    }
  });
}

export const useRejectInviteMutation = () => {
  type Props = { rmid: string, uid: string }
  return useMutation({
    mutationFn: ({ rmid, uid }: Props) => rejectRoomInvitation(uid, rmid),
    onMutate: ({ rmid, uid }: Props) => removeRoomFromInvitationList(rmid, uid),
    onError: (e, v, c) => {
      console.log(e);
      const queryClient = getQueryClient();
      if (!c) return;

      const { uid } = v;

      queryClient.setQueryData(getQueryKeys("roomInvitations_uid", { uid }), c.invitationPrevData);
    }
  });
}

export const usePostMessageInRoom = () => {

  type Props = { message: MessageSchemaType, rmid: string, uid: string, room: MereRoomType };
  return useMutation({
    mutationFn: ({ message, uid, rmid }: Props) => sendMessage(uid, rmid, message),
    onMutate: ({ room, message, rmid, uid }: Props) => {
      pushMessageIntoList({
        message: { ...message, status: "sending", room_id: rmid, user_id: uid },
        rmid,
        room,
        uid
      });
    },
    onError: (e, v) => {
      console.log(`Error occured while sending messgage`, e.message);
      const { message, rmid, uid } = v;
      updateMessageStatus(message._id, rmid, "error");
      setOrRemoveRoom({
        rmid, uid,
        update: true,
        room: { lastMessage: "ERROR" },
      });
    },
    onSuccess: (_, v) => {
      const { message, rmid } = v;
      updateMessageStatus(message._id, rmid, "sent");
    }
  });

}

export const useParticipantSeenUpdate = () => {

  type Props = { rmid: string, uid: string }

  return useMutation({
    mutationFn: ({ uid, rmid }: Props) => updateParticipantSeenAt(rmid, uid),
    onMutate: ({ rmid, uid }: Props) => {
      return { ...setOrRemoveRoom({ rmid, uid, update: true, room: { seenAt: Date.now() } }) }
    },
    onError: (e, v, c) => {
      console.log(`Error occured while setting seen at`, e.message);
      if (!c) return;
      const { uid, rmid } = v;
      const { roomPrevData, roomsPrevData } = c;
      const roomKey = getQueryKeys("room_rmid_uid", { rmid, uid });
      const roomsKey = getQueryKeys("rooms_uid", { uid });

      const qc = getQueryClient();
      qc.setQueryData(roomKey, roomPrevData);
      qc.setQueryData(roomsKey, roomsPrevData);
    },
  });
}

export const useRetryMessage = () => {
  type Props = { message: MessageSchemaType, rmid: string, uid: string };
  return useMutation({
    mutationFn: ({ message, uid, rmid }: Props) => sendMessage(uid, rmid, message),
    onMutate: ({ message, rmid }: Props) => {
      updateMessageStatus(message._id, rmid, "sending");
    },
    onError: (e, v) => {
      console.log(`Error occured while retrying message`, e.message);
      const { message, rmid } = v;
      updateMessageStatus(message._id, rmid, "error");
    },
    onSuccess: (_, v) => {
      const { message, rmid } = v;
      updateMessageStatus(message._id, rmid, "sent");
    }
  });
}

export const useRemoveMessage = () => {
  type Props = { msgid: string, rmid: string, uid: string };
  return useMutation({
    mutationFn: ({ msgid, uid, rmid }: Props) => unsendMessage(rmid, msgid, uid),
    onMutate: ({ msgid, rmid }: Props) => removeMessageFromClient(msgid, rmid)
    ,
    onError: (e, v, c) => {
      console.log(`Error occured while removing message`, e.message);
      getQueryClient()
        .setQueryData(
          getQueryKeys("messages_rmid", { rmid: v.rmid }),
          c?.prevMsgList
        );
    },
  });
}

/*

2. On message send.
    send message to everyone using channel

3. On room enter
    update last seen in participant meta



1. Create Room
    Client Side
      a. set room details
      b. push room into roomlist
    Server side
      a. Room and Participant documents created
      b. push Room id into room list of the creator - ex 1d
      e. set participant details
      c. push room id into invitation list of other participants - ex 1d
      d. push creator id into participants list of the room
      d. set room details

      
2. Accept room
  - Client Side
    a. push room into room list
    b. remove room from invitation list
  - Server Side
    a. Update participant details in db
    b. Update Participant details in cache
    c. push user id to participant list
    d. remove room from invitation list in cache

3. Reject Room
  - Client Side
    a. remove room from invitation list
  - Server Side
    a. remove participant doc from db
    b. remove participant doc from cache
    e. remove room from invitation list of user
      if (room == private)
        c. delete room and creator participant doc from db
        d. remove room from room list of creator and room userdata in cache
        f. remove room participant data for both of users

*/