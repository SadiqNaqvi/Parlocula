import { getRequest } from "@lib/helpers/common";
import { Post } from "@model";
import { NextRequest } from "next/server";
import { searchHandler } from "../util";
import { postsAggregationPipeline } from "@lib/pipelines";

export const GET = getRequest(async (r: NextRequest) =>
  searchHandler(r, postsAggregationPipeline, Post, ["title"])
);
