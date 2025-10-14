import {
  deleteRequest,
  getRequest,
  postRequest,
  updateRequest,
} from "@lib/helpers/common";
import { sendNotification } from "@lib/helpers/server";
import { ObjectId } from "@lib/utils";
import { Follow, User } from "@model";
import { User as UserType } from "@type/internal";

// Check the user-user connection.
export const GET = getRequest(
  async (_, params: { id: string; cuid: string }) => {
    const requestedUser = params.id;
    const currentUser = params.cuid;

    const result = await Follow.aggregate([
      {
        $facet: {
          isFollower: [
            {
              $match: {
                follower: ObjectId(currentUser),
                followee: ObjectId(requestedUser),
              },
            },
          ],
          isFollowing: [
            {
              $match: {
                followee: ObjectId(requestedUser),
                follower: ObjectId(currentUser),
              },
            },
          ],
        },
      },
    ]);

    const follow: { isFollower: any[]; isFollowing: any[] } = result[0];
    const { isFollower, isFollowing } = follow;

    const follows = isFollower[0];
    const followBack = isFollowing[0];

    const connection = {
      follows: Boolean(follows),
      followBack: Boolean(followBack),
      isBlocked: Boolean(follows && follows.blocked),
      haveBlocked: Boolean(followBack && followBack.blocked),
      notification: Boolean(follows && follows.notification),
    };

    return { result: connection, success: true };
  }
);

// Check if the current user is blocked by the requested user;
const preCheck = async ({
  params,
  user_id,
}: {
  params: { id: string };
  user_id: string;
}) => {
  const { id } = params;

  const isBlocked = await Follow.exists({
    follower: user_id,
    followee: id,
    blocked: true,
  });

  if (isBlocked) return { success: false, errCode: "temporary_banned" };
  return { success: true };
};

// Following a user.
export const POST = postRequest({
  handler: async ({ data, user_id, session, username, params }) => {
    const requestedUser = params.id;
    const notification = data.notification;

    await Follow.create(
      [
        {
          follower: user_id,
          followee: requestedUser,
          blocked: false,
          notification,
        },
      ],
      { session }
    );

    await User.findByIdAndUpdate(
      user_id,
      {
        $inc: { following_count: 1 },
      },
      { session }
    );

    const req_user = await User.findByIdAndUpdate<UserType>(
      requestedUser,
      {
        $inc: { follower_count: 1 },
      },
      { session }
    );

    if (!req_user) return { success: false, errCode: "invalid_object_id" };

    await sendNotification(
      [
        {
          title: `${username} started following you`,
          path: `/u/${username}`,
          message: [
            { type: "link", label: username, path: `/u/${username}` },
            { type: "text", text: "started following you." },
          ],
          user_id: req_user._id,
        },
      ],
      session
    );

    return {
      result: true,
      success: true,
      available: "followUnfollow_rid_uid",
      options: { rid: requestedUser, uid: user_id },
    };
  },
  preCheck,
});

// Unfollowing a user.
export const DELETE = deleteRequest(async ({ user_id, session, params }) => {
  const requestedUser = params.id;

  const doc = await Follow.findOneAndDelete(
    {
      follower: user_id,
      followee: requestedUser,
    },
    { session }
  );

  if (!doc) return { success: true };

  await User.findByIdAndUpdate(
    user_id,
    {
      $inc: { following_count: -1 },
    },
    { session }
  );

  await User.findByIdAndUpdate(
    requestedUser,
    {
      $inc: { follower_count: -1 },
    },
    { session }
  );

  return {
    result: true,
    success: true,
    errCode: null,
    available: "followUnfollow_rid_uid",
    options: { rid: requestedUser, uid: user_id },
    files: [],
  };
});

// Modifying user notification
export const PATCH = updateRequest({
  handler: async ({ params, data, session, user_id }) => {
    const { id } = params;

    await Follow.findOneAndUpdate(
      {
        follower: id,
        followee: user_id,
      },
      { $set: data },
      { session }
    );
    return {
      success: true,
      result: null,
      available: "followUnfollow_rid_uid",
      options: { rid: id, uid: user_id },
    };
  },
});
