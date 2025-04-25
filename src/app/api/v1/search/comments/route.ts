import { getRequest } from "@lib/helpers/common";
import { Comment } from "@model";
import { NextRequest } from "next/server";
import { searchHandler } from "../util";
import { commentsAggregationPipeline } from "@lib/pipelines";

export const GET = getRequest(async (r: NextRequest) =>
  searchHandler(r, commentsAggregationPipeline, Comment, ["content"])
);
