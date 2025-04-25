import { postRequest } from "@lib/helpers/common";
import { ObjectId } from "@lib/utils";
import { Item, List } from "@model";

// Remove multiple items from a list
export const POST = postRequest({
  handler: async ({ params, data, session, user_id }) => {
    const { id } = params;

    await Item.deleteMany(
      {
        _id: { $in: data },
        list_id: ObjectId(id),
        user_id: ObjectId(user_id),
      },
      { session, ordered: true }
    );

    await List.findByIdAndUpdate(
      ObjectId(id),
      {
        $inc: { item_count: -data.length },
      },
      { session, ordered: true }
    );

    return {
      files: [],
      success: true,
      result: null,
      available: "addItemsInList_lid",
      options: { lid: id },
    };
  },
});
