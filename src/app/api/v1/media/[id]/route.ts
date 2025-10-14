import { getRequest, postRequest } from "@lib/helpers/common";
import { Media } from "@model";

export const GET = getRequest(async (_, params: { id: string }) => {
  const { id } = params;
  const mediaDoc = await Media.findOne({ tmdb_id: id });

  if (!mediaDoc) return { success: false, errCode: "resource_not_found" };
  return { result: mediaDoc, success: true };
});

export const POST = postRequest({
  handler: async ({ data, params, session }) => {
    const { id } = params;
    const mediaDoc = (await Media.create([data], { session }))[0];
    return {
      result: mediaDoc,
      success: true,
      available: "media_tmdbid",
      options: { tmdbid: id },
    };
  },
});
