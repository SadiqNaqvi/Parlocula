import { deleteRequest } from "@lib/helpers/common";
import { Follow, User } from "@model";

export const DELETE = deleteRequest(async ({ params, user_id, session }) => {
  const { id } = params;
  const doc = await Follow.findOneAndDelete(
    {
      follower: user_id,
      followee: id,
    },
    { session }
  );

  if (doc) {
    await User.findByIdAndUpdate(
      user_id,
      { $inc: { followers: -1 } },
      { session }
    );

    await User.findByIdAndUpdate(id, { $inc: { following: 1 } }, { session });
  }

  return {
    success: true,
    result: null,
    files: [],
    available: "followUnfollow_rid_uid",
    options: { rid: user_id, uid: id },
  };
});
