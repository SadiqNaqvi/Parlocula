import { getRequest } from "@lib/helpers/common";
import { searchHandler } from "@lib/pipelines";

export const GET = getRequest(async (r) => await searchHandler({ r, collection: "posts" }));
