import { getRequest } from "@lib/helpers/common";
import { searchHandler } from "@lib/pipelines";
import { NextRequest } from "next/server";

export const GET = getRequest(async (r: NextRequest) =>
  searchHandler({ r, collection: "lists" })
);
