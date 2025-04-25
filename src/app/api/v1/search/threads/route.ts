import { getRequest } from "@lib/helpers/common";
import { Thread } from "@model";
import { searchHandler } from "../util";
import { threadsAggregationPipeline } from "@lib/pipelines";

export const GET = getRequest(
  async (r: any) =>
    await searchHandler(r, threadsAggregationPipeline, Thread, ["name"])
);
