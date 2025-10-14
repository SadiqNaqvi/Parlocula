import { postRequest } from "@lib/helpers/common";
import { addParticipantInRoom } from "@lib/helpers/redis";
import Participant from "@model/participants";

// Accepting room invitation.
export const POST = postRequest({
  handler: async ({ params, user_id }) => {
    const { id } = params;
    await Participant.findOneAndUpdate(
      {
        room_id: id,
        user_id,
      },
      { $set: { type: "participant", seenAt: Date.now() } }
    );
    await addParticipantInRoom(user_id, id);
    return { success: true, result: null, revalidateQueue: [] };
  },
});