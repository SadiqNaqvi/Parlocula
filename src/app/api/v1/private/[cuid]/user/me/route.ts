import { getRequest } from "@lib/helpers/common";
import { ObjectId } from "@lib/utils";
import { User } from "@model";
import { currentUserPipeline } from "@lib/pipelines";

export const GET = getRequest(async (_, params: { cuid: string }) => {
  const { cuid } = params;

  const response = await User.aggregate(
    currentUserPipeline({ _id: ObjectId(cuid) })
  );

  if (!response.length) return { success: false, errCode: "pp104" };

  const result = response[0];

  return { result, success: true };
});
