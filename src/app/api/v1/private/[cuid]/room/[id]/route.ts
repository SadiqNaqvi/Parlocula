import { deleteRequest, getRequest, postRequest } from "@lib/helpers/common";
import { deleteRoom } from "@lib/helpers/deletion";
import { getParticipant, getRoomDetails, setDataWhileCreatingRoom, setRoomDetail } from "@lib/helpers/redis";
import { roomSchema } from "@lib/schemas";
import { ObjectId } from "@lib/utils";
import { Follow } from "@model";
import Participant from "@model/participants";
import Room from "@model/rooms";
import {
  FullRoomType
} from "@type/internal";
import { RoomSchemaType } from "@type/schemas";

// Get the details of the room
export const GET = getRequest(async (_, params) => {
  const { cuid, id } = params;

  const room = await getRoomDetails(id, cuid);
  if (room) return { success: true, result: room };

  const resp = await Room.aggregate([
    { $match: { _id: ObjectId(id) } },
    {
      $lookup: {
        from: "participants",
        let: { room_id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$room_id", "$$room_id"] },
                  { $eq: ["$user_id", ObjectId(cuid)] },
                ],
              },
            },
          },
          { $limit: 1 },
        ],
        as: "participant",
      },
    },
    {
      $lookup: {
        from: "participants",
        let: { room_id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$room_id", "$$room_id"] },
                  { $ne: ["$user_id", ObjectId(cuid)] },
                  { $ne: ["$type", "invitee"] },
                ],
              },
            },
          },
          { $limit: 1 },
        ],
        as: "participants",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "participants.user_id",
        foreignField: "_id",
        as: "users",
      },
    },
    {
      $addFields: {
        "users.seenAt": { $arrayElemAt: ["$participants.seenAt", 0] },
        "users.participantType": { $arrayElemAt: ["$participants.type", 0] },
        participantType: { $arrayElemAt: ["$participant.type", 0] },
        seenAt: { $arrayElemAt: ["$participant.seenAt", 0] },
        mute: { $arrayElemAt: ["$participant.mute", 0] },
        display_name: {
          $cond: {
            if: { $eq: ["$type", "group"] },
            then: "$name",
            else: { $arrayElemAt: ["$users.username", 0] },
          },
        },
        poster: {
          $cond: {
            if: { $eq: ["$type", "group"] },
            then: "$poster",
            else: { $arrayElemAt: ["$users.profile", 0] },
          },
        },
        otherParticipant_id: {
          $cond: {
            if: { $eq: ["$type", "group"] },
            then: undefined,
            else: { $arrayElemAt: ["$participants.user_id", 0] },
          },
        },
        otherParticipant_seenAt: {
          $cond: {
            if: { $eq: ["$type", "group"] },
            then: undefined,
            else: { $arrayElemAt: ["$participants.seenAt", 0] },
          },
        },
      },
    },
    {
      $project: {
        "users.username": 1,
        "users.profile": 1,
        "users._id": 1,
        type: 1,
        lastMessage: 1,
        lastMessageBy: 1,
        lastMessageAt: 1,
        participantType: 1,
        otherParticipant_seenAt: 1,
        otherParticipant_id: 1,
        display_name: 1,
        poster: 1,
        seenAt: 1,
        mute: 1,
        invitationMessage: 1,
      },
    },
  ]);

  const result: FullRoomType = resp[0];
  if (result?.users.length === 0) return { success: false, errCode: "resource_not_found" };

  if (result) await setRoomDetail(id, result, false);

  return { success: true, result };
});

// Create a new room
export const POST = postRequest<RoomSchemaType>({
  handler: async ({ data, frames, params, user_id, username, session }) => {
    const { inviteMessage, type, name, participants } = data;
    const { id } = params;

    const isPrivate = type === "private";

    const room = (
      await Room.create(
        [
          {
            _id: id,
            participants: isPrivate ? [...participants, user_id].sort() : [],
            type,
            name: isPrivate ? undefined : name,
            poster: isPrivate ? undefined : frames[0]?.path,
            lastMessage: inviteMessage,
            lastMessageAt: Date.now(),
            lastMessageBy: user_id,
            invitationMessage: {
              content: inviteMessage,
              createdAt: Date.now(),
              username,
              user_id,
            },
          },
        ],
        { session }
      )
    )[0].toObject();

    if (!room)
      return { success: false, errCode: "data_storing_fail" };

    const now = new Date(Date.now() - 1000 * 3600 * 24);

    const userParticipant = (await Participant.create(
      [
        {
          hideAt: now,
          mute: false,
          room_id: id,
          seenAt: now,
          type: isPrivate ? "participant" : "creator",
          user_id,
        },
      ],
      { session }
    )).map(d => d.toObject());

    const otherParticipants = (await Participant.create(
      participants.map((uid) => ({
        hideAt: now,
        mute: false,
        room_id: id,
        seenAt: now,
        type: "invitee",
        user_id: uid,
      })),
      { session }
    )).map(d => d.toObject());

    await setDataWhileCreatingRoom(room, user_id, userParticipant.concat(otherParticipants));

    return {
      success: true,
      result: room,
      revalidateQueue: participants.map((u) => `roomInvitations-${u}`),
    };
  },
  preCheck: async ({ data, user_id }) => {
    const { participants } = data;
    const isBlocked = await Follow.findOne({
      follower: user_id,
      followee: { $in: participants },
      blocked: true,
    });

    if (isBlocked) return { success: false, errCode: "blocked_by_author" };
    return { success: true };
  },
  schema: roomSchema,
});

// Deleting a non-private room
export const DELETE = deleteRequest(async ({ params, user_id, session }) => {
  const { id } = params;

  const participant = await getParticipant(params.id, user_id);

  if (participant.participantType !== "creator") return { success: false, errCode: "unauthorized_access" };

  await deleteRoom({ _id: id, type: { $ne: "private" } }, session);

  return { success: true };
});
