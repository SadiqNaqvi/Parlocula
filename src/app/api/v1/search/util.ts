import { getPageParams } from "@lib/utils";
import { GeneralGetReturn, PipelineFunc } from "@type/internal";
import { Model } from "mongoose";

export const searchHandler = async (
  r: any,
  pipelineFunc: PipelineFunc,
  Model: Model<any>,
  key: string[],
  collection?: "user" | "list"
): Promise<GeneralGetReturn> => {
  const searchParams = r.nextUrl.searchParams;
  const query: string | null = searchParams.get("q");
  const nsfw: string | null = searchParams.get("nsfw");
  if (!query) return { success: false, errCode: "pp500" };

  const page = getPageParams(r) - 1;

  const searchTerms = query
    .split(/\s+/) // Split by spaces
    .map((term) => term.replace(/[^a-zA-Z0-9]/g, "")) // Remove punctuation
    .filter((term) => term.length > 0);

  const regex = key.reduce(
    (t, c) => [
      ...t,
      ...searchTerms.map((s) => ({ [c]: { $regex: s, $options: "i" } })),
    ],
    [] as any[]
  );

  const match =
    collection === "user"
      ? { $or: regex, isActive: true }
      : collection === "list" //Making sure no private list is visible in search results
      ? { $or: regex, isPrivate: false, list_type: "custom" }
      : nsfw === "true"
      ? { $or: regex }
      : { $or: regex, nsfw: false };

  console.log(match);

  const result = await Model.aggregate(
    pipelineFunc({ filters: [{ $match: match }], page, sort: undefined })
  );

  if (result && result.length) return { success: true, result: result[0] };
  return { success: false, errCode: "pp104" };
};

/*
{
  const query = r.nextUrl.searchParams.get("q");
  if (!query) return null;

  const page = getPageParams(r) - 1;

  // Step 1: Clean and split the query into terms
  const searchTerms = query
    .split(/\s+/) // Split by spaces
    .map((term) => term.replace(/[^a-zA-Z0-9]/g, "")) // Remove punctuation
    .filter((term) => term.length > 0); // Remove empty terms

  // Step 2: Build regex conditions for each term
  const regexConditions = searchTerms.map((term) => ({
    title: { $regex: `\\b${term}\\b`, $options: "i" }, // Word boundary + case-insensitive
  }));

  // Step 3: Run the aggregation pipeline
  return [
    {
      $match: {
        $text: { $search: query }, // Broad text search first
      },
    },
    {
      $match: {
        $and: regexConditions, // Ensure ALL terms appear in the title
      },
    },
    {
      $facet: {
        total: [{ $count: "total" }],
        data: [
          { $skip: page * queryLimit },
          { $limit: queryLimit },
          {
            $addFields: {
              score: { $meta: "textScore" }, // Rank by relevance
            },
          },
          {
            $sort: { score: -1 }, // Highest score first
          },
          {
            $project: { ...projection, score: 1 },
          },
        ],
      },
    },
    {
      $project: {
        total: "$total.total",
        data: 1,
      },
    },
  ];

*/
