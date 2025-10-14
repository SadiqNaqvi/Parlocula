import { getRequest, postRequest } from "@lib/helpers/common";
import { capitalize, isValidObjectId } from "@lib/utils";
import Report from "@model/reports";
import { ReportSchemaType } from "@type/schemas";

export const POST = postRequest<ReportSchemaType>({
  handler: async ({ data, user_id }) => {
    await Report.create([{ ...data, user_id }]);

    return {
      success: true,
      result: null,
      revalidateQueue: [],
    };
  },
});

export const GET = getRequest(async (r, params) => {
  const search = r.nextUrl.searchParams;
  const ctype = search.get("type")?.toLowerCase();
  const cid = search.get("id");

  if (
    !ctype ||
    !cid ||
    !["comment", "post", "thread", "user"].includes(ctype) ||
    !isValidObjectId(cid)
  )
    return {
      success: false,
      errCode: "unstable_internet",
      customError: "Invalid content type or id",
    };

  const result = await Report.findOne({
    user_id: params.cuid,
    content_type: capitalize(ctype),
    content_id: cid,
  });

  return { success: true, result };
});
