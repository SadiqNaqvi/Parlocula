import { getRequest } from "@lib/helpers/common";
import { ObjectId } from "@lib/utils";
import { User } from "@model";
import { currentUserPipeline } from "@lib/pipelines";
import { UserModelType } from "@type/models";

export const GET = getRequest(async (_, params: { cuid: string }) => {
  const { cuid } = params;

  const response = await User.aggregate(
    currentUserPipeline({ _id: ObjectId(cuid) })
  );

  if (!response.length) return { success: false, errCode: "pp104" };

  const user: Omit<
    UserModelType,
    "initialGenres" | "password" | "session_id" | "isActive" | "lastLoginAt"
  > = response[0];

  const { banEndsAt, isBanned, ...result } = user;

  return { result, success: true };
});
