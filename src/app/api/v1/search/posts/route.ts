import { getHandler } from "@lib/helpers/handlers";
import { searchHandler } from "@lib/pipelines";

export const GET = getHandler(async (r) =>
    await searchHandler({ r, filters: [], type: "posts" })
);
