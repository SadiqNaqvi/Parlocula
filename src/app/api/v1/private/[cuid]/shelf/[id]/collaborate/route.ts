import { postHandler } from "@lib/helpers/handlers";
import { addItemsInShelf } from "@lib/helpers/server";
import { Taleon, Shelf, ShelfItem } from "@model";
import Collaborator from "@model/collaborators";
import { TaleonSchemaType } from "@type/schemas";

// Add item in collaborative list
export const POST = postHandler<{ items: TaleonSchemaType[] }>({
    handler: async ({ data, params, user_id, session }) => {

        const { id } = params;
        const { items } = data;

        const createdItems = addItemsInShelf(items, "custom", id, user_id, session);

        // const exists = await ShelfItem.exists({ shelf_id: id, taleon_id });

        // if (exists)
        //     return { success: true, result: null, revalidateQueue: [] }

        // const taleon = await Taleon.findById(taleon_id);

        // if (!taleon) return {
        //     success: false, errCode: "resource_not_found"
        // }

        // await ShelfItem.insertOne({
        //     taleon_id,
        //     ext_id: taleon.ext_id,
        //     shelf_id: id,
        //     user_id,
        //     year: taleon.year,
        // }, { session });

        const shelf = await Shelf.findByIdAndUpdate(id, {
            $inc: { item_count: items.length },
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
});