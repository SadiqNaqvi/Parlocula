import { deleteRequest, updateRequest } from "@lib/helpers/common";
import { deleteRoom } from "@lib/helpers/deletion";
import { getParticipantsOfRoom, removeRoomFromInvitation, updateParticipantSeenAt } from "@lib/helpers/redis";
import { publishAblyEvent } from "@lib/providers/ably";
import Participant from "@model/participants";

// Update Participant seen at when participant enters a room
export const PATCH = updateRequest({
  handler: async ({ user_id, params }) => {
    const { id } = params;

    const done = await updateParticipantSeenAt(id, user_id);
    if (!done) return { success: false, errCode: "unauthorized_access" }

    const participants = await getParticipantsOfRoom(id) as string[];

    await publishAblyEvent(
      "entered_chat",
      { user_id, room_id: id, time: Date.now() },
      participants.filter(p => p.split('-')[1] !== "invitee").map(p => p.split('-')[0])
    )

    return { success: true, result: null, revalidateQueue: [] }
  }
})

// Leaving a room or rejecting room invitation
export const DELETE = deleteRequest(async ({ params, user_id, session }) => {
  const { id } = params;
  await Participant.findOneAndDelete(
    {
      room_id: id,
      user_id,
    },
    { session }
  );

  const totalParticipants = await Participant.countDocuments({
    room_id: id,
  });

  await removeRoomFromInvitation(user_id, id, Boolean(totalParticipants < 2))

  if (totalParticipants < 2) await deleteRoom({ _id: id }, session);

  return { success: true, result: null, revalidateQueue: [] };
});