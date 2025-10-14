import { queryLimit } from "@lib/constants";
import { getRequest, postRequest } from "@lib/helpers/common";
import { checkIfParticipantExists, getMessagesFromCache, getParticipantsOfRoom, handleNewMessage, storeMessagesInCache } from "@lib/helpers/redis";
import { publishAblyEvent } from "@lib/providers/ably";
import { messageSchema } from "@lib/schemas";
import { getPageParams, ObjectId } from "@lib/utils";
import Participant from "@model/participants";
import { MessageModelType } from "@type/models";
import { MessageSchemaType } from "@type/schemas";

// Get Messages of a room
export const GET = getRequest(async (r, params) => {
  const { cuid, id } = params;
  const page = getPageParams(r) - 1;

  const response = page < 2 ? await getMessagesFromCache(id, page) : null;
  if (response) return { success: true, result: response };

  const room_id = ObjectId(id);

  const resp = await Participant.aggregate([
    { $match: { room_id, user_id: ObjectId(cuid) } }, // checking if the current user is a participant of the room
    {
      $lookup: {
        from: "messages",
        let: { room_id: "$room_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$room_id", "$$room_id"] },
            },
          },
          {
            $facet: {
              total: [{ $count: "count" }],
              data: [
                { $sort: { createdAt: -1 } },
                { $skip: queryLimit * page },
                { $limit: queryLimit },
              ],
            },
          },
          {
            $project: {
              data: 1,
              total: { $arrayElemAt: ["$total.count", 0] },
            },
          },
        ],
        as: "messages",
      },
    },
    {
      $project: {
        _id: 0,
        total: { $arrayElemAt: ["$messages.total", 0] },
        data: { $arrayElemAt: ["$messages.data", 0] },
      },
    },
  ]);

  const result = resp[0] ?? { data: [], total: 0 };
  if (page < 2 && result.data.length)
    await storeMessagesInCache(id, result.data, result.total);

  return { success: true, result };
});

// Post messages in a room
export const POST = postRequest<MessageSchemaType>({
  handler: async ({ params, user_id, data, username, session }) => {
    const room_id = params.id;

    const { room, ...rest } = data;

    const message: MessageModelType = { ...rest, room_id, user_id, username };

    await handleNewMessage(room_id, user_id, message, session);

    const participants = await getParticipantsOfRoom(room_id) as string[];

    await publishAblyEvent(
      "message",
      { ...rest, room, room_id, user_id },
      participants.filter(p => p.split('-')[1] !== "invitee").map(p => p.split('-')[0])
    )

    return { success: true, result: null, revalidateQueue: [] };
  },
  schema: messageSchema,
  preCheck: async ({ params, user_id }) => {
    const participantExists = await checkIfParticipantExists(params.id, user_id);
    if (participantExists) return { success: true };
    else return { success: false, errCode: "unauthorized_access" };
  },
});

