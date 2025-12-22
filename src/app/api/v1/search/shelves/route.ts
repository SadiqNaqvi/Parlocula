import { getHandler } from "@lib/helpers/handlers";
import { searchHandler } from "@lib/pipelines";
import { NextRequest } from "next/server";

export const GET = getHandler(async (r: NextRequest) =>
  searchHandler({
    r,
    filterInsideSearch: { isPrivate: false },
    filters: [],
    type: "shelves",
  })
);
