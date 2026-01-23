import { getHandler, postHandler } from "@lib/helpers/handlers";
import { Cinement } from "@model";
import { CinementSchemaType } from "@type/schemas";

// Get media item by id
export const GET = getHandler(async (_, params) => {
  const { id } = params;
  const mediaDoc = await Cinement.findOne({ ext_id: id });

  if (!mediaDoc) return { success: false, errCode: "resource_not_found" };
  return { result: mediaDoc, success: true };
});

// Store media item 
export const POST = postHandler<CinementSchemaType>({
  handler: async ({ data, params, session }) => {
    console.log("cinement post handler me aaya");
    const { id } = params;
    const mediaDoc = (await Cinement.create([data], { session }))[0];

    console.log("mediaDoc", mediaDoc);


    return {
      result: mediaDoc.toObject(),
      success: true,
      available: "cinement_extid",
      options: { extid: id },
    };
  },
  skipUserCheck: true,
});
