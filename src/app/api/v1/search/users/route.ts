import { getRequest } from "@lib/helpers/common";
import { User } from "@model";
import { NextRequest } from "next/server";
import { searchHandler } from "../util";
import { usersAggregationPipeline } from "@lib/pipelines";

export const GET = getRequest(async (r: NextRequest) =>
  searchHandler(r, usersAggregationPipeline, User, ["username", "name"], "user")
);
