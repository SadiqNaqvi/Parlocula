import { getHandler } from "@lib/helpers/handlers";
import Collaborator from "@model/collaborators";

// Check if a user is collaborator/invitee of the shelf or not
export const GET = getHandler(async (r, params) => {

    const { cuid, id } = params;

    const response = await Collaborator.findOne({
        user_id: cuid,
        shelf_id: id
    }).exec().then(r => r?.toObject());

    return {
        success: true,
        result: response,
    }

})