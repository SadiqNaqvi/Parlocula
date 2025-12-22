import { updateHandler } from "@lib/helpers/handlers";
import { addParticipantInRoom } from "@lib/helpers/redis/messaging";
import { Room, User } from "@model";
import Participant from "@model/participants";

// Accepting room invitation.
export const PATCH = updateHandler({
  handler: async ({ params, user_id, session }) => {
    const { id } = params;

    await Participant.findOneAndUpdate(
      {
        room_id: id,
        user_id,
      },
      { $set: { type: "participant", seenAt: new Date() } },
      { session }
    );

    await Room.findByIdAndUpdate(
      id,
      { $inc: { participant_count: 1 } },
      { session }
    );

    await User.findByIdAndUpdate(user_id, {
      $inc: { rooms: 1 }
    }, { session });

    await addParticipantInRoom(user_id, id);
    return { success: true, result: null, revalidateQueue: [] };
  },
});