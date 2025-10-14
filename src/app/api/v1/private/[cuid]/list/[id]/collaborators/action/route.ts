import { deleteRequest, updateRequest } from "@lib/helpers/common";
import { List } from "@model";

// User accepted the invitation to become a collaborator
export const PATCH = updateRequest({
  handler: async ({ params, user_id }) => {
    const { id } = params;

    await List.findByIdAndUpdate(id, {
      $pull: { invitees: user_id },
      $addToSet: { collaborators: user_id },
    });

    return {
      success: true,
      result: null,
      available: "listCollaboratorsMutation_lid",
      options: { lid: id },
    };
  },
  preCheck: async ({ user_id, params }) => {
    const { id } = params;
    const list = await List.findById<{ invitees: string[] }>(id, {
      invitees: 1,
    });

    if (list?.invitees?.find((u) => u === user_id)) return { success: true };

    return { success: false, errCode: "unauthorized_access" };
  },
});

// User rejected the invitation to become a collaborator
export const DELETE = deleteRequest(async ({ params, user_id }) => {
  const { id } = params;

  await List.findByIdAndUpdate(id, {
    $pull: { invitees: user_id },
  });

  return {
    success: true,
    result: null,
    available: "listCollaboratorsMutation_lid",
    options: { lid: id },
  };
});
