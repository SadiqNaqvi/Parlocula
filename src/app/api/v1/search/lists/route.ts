import { getRequest } from "@lib/helpers/common";
import { List } from "@model";
import { NextRequest } from "next/server";
import { searchHandler } from "../util";
import { listsAggregationPipeline } from "@lib/pipelines";

export const GET = getRequest(async (r: NextRequest) =>
  searchHandler(r, listsAggregationPipeline, List, ["name"], "list")
);
