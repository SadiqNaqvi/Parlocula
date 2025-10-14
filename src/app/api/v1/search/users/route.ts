import { getRequest } from "@lib/helpers/common";
import { searchHandler } from "@lib/pipelines";

export const GET = getRequest(async (r) => searchHandler({ r, collection: "users" }));
