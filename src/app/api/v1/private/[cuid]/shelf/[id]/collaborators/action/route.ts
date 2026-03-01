import { deleteHandler, updateHandler } from "@lib/helpers/handlers";
import { sendNotification } from "@lib/helpers/server";
import { getPoster } from "@lib/utils";
import { Shelf } from "@model";
import Collaborator from "@model/collaborators";

// User accepted the invitation to become a collaborator
export const PATCH = updateHandler({
  handler: async ({ params, user_id, profile, session, username }) => {

    const { id } = params;

    const check = await Collaborator.findOneAndUpdate(
      { shelf_id: id, user_id },
      { $set: { type: "collaborator" } },
      { session }
    );

    if (!check)
      return { success: false, errCode: "resource_not_found" }

    const shelf = await Shelf.findById(id, { user_id: 1, poster: 1 });

    if (!shelf)
      return { success: false, errCode: "resource_not_found" }

    await sendNotification([
      {
        message: [
          { type: "text", text: "Congratulations! " },
          { type: "link", label: `@${username}`, path: `/user/${username}` },
          { type: "text", text: "has accepted your request to become a collaborator in your shelf." }
        ],
        title: `New Collaborator for your shelf 🥳`,
        poster: profile ? profile : shelf.poster ? getPoster({ external: true, path: shelf.poster, size: "w92", type: "poster" }) : undefined,
        user_id: shelf.user_id,
        metadata: { shelf_id: id },
      }
    ], session);

    return {
      success: true,
      result: null,
      available: "shelfCollaboratorMutation_uid_sid",
      options: { sid: id, uid: user_id },
    };
  }
});

// User rejected the invitation to become a collaborator
export const DELETE = deleteHandler(async ({ params, user_id, session }) => {
  const { id } = params;

  await Collaborator.deleteOne({ shelf_id: id, user_id }, { session });

  return {
    success: true,
    result: null,
    available: "shelfCollaboratorMutation_uid_sid",
    options: { sid: id, uid: user_id },
  };
});