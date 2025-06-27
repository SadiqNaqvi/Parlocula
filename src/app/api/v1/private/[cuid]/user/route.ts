import { getRequest, updateRequest } from "@lib/helpers/common";
import { getTimeInFuture, ObjectId } from "@lib/utils";
import { User } from "@model";
import { currentUserPipeline } from "@lib/pipelines";
import { UserModelType } from "@type/models";
import { userUpdateSchema } from "@lib/schemas";
import * as bcrypt from "bcrypt";

export const GET = getRequest(async (_, params: { cuid: string }) => {
  const { cuid } = params;

  const response = await User.aggregate(
    currentUserPipeline({ _id: ObjectId(cuid) })
  );

  if (!response.length) return { success: false, errCode: "pp104" };

  const user: Omit<
    UserModelType,
    "initialGenres" | "passkey" | "session_id" | "isActive" | "lastLoginAt"
  > = response[0];

  const { banEndsAt, isBanned, ...result } = user;

  return { result, success: true };
});

export const PATCH = updateRequest({
  handler: async ({ data, frames, session, user_id, username }) => {
    const dataToUpdate = Object({
      ...data,
      ...(frames && frames.length && { profile: frames[0].path }),
    });

    const result = await User.findOneAndUpdate(
      { _id: user_id },
      { $set: { ...dataToUpdate, edited_at: new Date() } },
      { session }
    );

    return {
      success: true,
      result,
      available: "userMutation_uid_username",
      options: { uid: user_id, username },
    };
  },
  schema: userUpdateSchema,
});
