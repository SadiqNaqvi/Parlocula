import { deleteRequest, postRequest } from "@lib/actions/actions";
import { ObjectId } from "@lib/utils";
import { Follow, User } from "@model";

export const POST = postRequest({
  handler: async ({ params, user_id, session }) => {
    const { id } = params;
    const follow = (
      await Follow.aggregate([
        {
          $facet: {
            isFollower: [
              // If current user is a follower of the requested User?
              {
                $match: {
                  follower: ObjectId(user_id),
                  followee: ObjectId(id),
                },
              },
            ],
            isFollowing: [
              // If current user is a being followed by the requested User?
              {
                $match: {
                  followee: ObjectId(id),
                  follower: ObjectId(user_id),
                },
              },
            ],
          },
        },
        {
          $project: {
            isFollower: { $size: "$isFollower" },
            isFollowing: { $size: "$isFollowing" },
          },
        },
      ])
    )[0];

    await Follow.updateOne(
      {
        follower: id,
        followee: user_id,
      },
      {
        follower: id,
        followee: user_id,
        blocked: true,
        notification: false,
      },
      { session }
    );

    if (follow.isFollower) {
      await User.findByIdAndUpdate(
        user_id,
        {
          $inc: { following_count: -1 },
        },
        { session }
      );
      await User.findByIdAndUpdate(
        id,
        {
          $inc: { follower_count: -1 },
        },
        { session }
      );
    }

    if (follow.isFollowing) {
      await User.findByIdAndUpdate(
        user_id,
        {
          $inc: { follower_count: -1 },
        },
        { session }
      );
      await User.findByIdAndUpdate(
        id,
        {
          $inc: { following_count: -1 },
        },
        { session }
      );
    }

    return {
      result: null,
      success: true,
      available: "connection_rid_uid",
      options: { rid: id, uid: user_id },
    };
  },
});

export const DELETE = deleteRequest(async ({ params, user_id }) => {
  const { id } = params;

  await Follow.findOneAndDelete({
    follower: id,
    followee: user_id,
    blocked: true,
  });

  return {
    result: null,
    success: true,
    available: "connection_rid_uid",
    options: { rid: id, uid: user_id },
    files: [],
  };
});
