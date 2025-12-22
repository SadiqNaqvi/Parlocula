import { postHandler } from "@lib/helpers/handlers";
import { Cinement, Shelf, ShelfItem } from "@model";
import Collaborator from "@model/collaborators";

// Add item in collaborative list
export const POST = postHandler<{ cinement_id: string }>({
    handler: async ({ data, params, user_id, session }) => {

        const { id } = params;
        const { cinement_id } = data;

        const exists = await ShelfItem.exists({ shelf_id: id, cinement_id });

        if (exists)
            return { success: true, result: null, revalidateQueue: [] }

        const cinement = await Cinement.findById(cinement_id);

        if (!cinement) return {
            success: false, errCode: "resource_not_found"
        }

        await ShelfItem.insertOne({
            cinement_id,
            ext_id: cinement.ext_id,
            shelf_id: id,
            user_id,
            year: cinement.year,
        }, { session });

        const shelf = await Shelf.findByIdAndUpdate(id, {
            $inc: { item_count: 1 },
            $set: { last_added: Date.now() }
        }, { session })

        if (!shelf) return {
            success: false, errCode: "resource_not_found"
        }

        return {
            success: true, result: null, revalidateQueue: []
        }


    },
    preCheck: async ({ params, user_id }) => {
        const { id } = params;
        const exists = await Collaborator.exists({ shelf_id: id, user_id });
        if (exists) return { success: true }
        return { success: false, errCode: "unauthorized_access" }

    }
})