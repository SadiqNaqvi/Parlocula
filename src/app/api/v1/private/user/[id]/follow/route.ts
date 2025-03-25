import { deleteRequest, getRequest, postRequest } from "@lib/actions/actions";
import { getCurrentUser } from "@lib/actions/serverActions";
import { connectPPDB } from "@lib/database";
import { ObjectId } from "@lib/utils";
import { User, Follow } from "@model";

export const GET = getRequest(async (r: any, params: { id: string }) => {
  const requestedUser = params.id;
  const currentUser = (await getCurrentUser(r))?.user_id;
  if (!currentUser) return { success: false, errCode: "pp202" };
  const follow = (
    await Follow.aggregate([
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
      {
        $project: {
          isFollower: { $size: "$isFollower" },
          isFollowing: { $size: "$isFollowing" },
        },
      },
    ])
  )[0];
  return { result: follow, success: true };
});

const preCheck = async ({
  params,
  user_id,
}: {
  params: { id: string };
  user_id?: string;
}) => {
  const { id } = params;
  if (!user_id) return { success: false, errCode: "pp202" };
  try {
    const isDbConnected = await connectPPDB();
    if (!isDbConnected) return { success: false, errCode: "pp101" };

    const user = (
      await User.aggregate([
        { $match: { _id: ObjectId(id) } },
        {
          $lookup: {
            from: "follows",
            let: { req: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$followee", "$$req"] },
                      { $eq: ["$follower", ObjectId(user_id)] },
                      { $eq: ["$blocked", true] },
                    ],
                  },
                },
              },
            ],
            as: "isBlocked",
          },
        },
        {
          $project: {
            isBlocked: 1,
          },
        },
      ])
    )[0];

    if (!user || user.isBlocked)
      return {
        success: false,
        errCode: user.isBlocked ? "pp202" : "pp207",
      };
    return { success: true };
  } catch (err: any) {
    console.error("Error occured in precheck at private/");
    return { success: false, errCode: "pp100" };
  }
};

export const POST = postRequest({
  handler: async ({ data, user_id, session, params }) => {
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
    await User.findByIdAndUpdate(
      requestedUser,
      {
        $inc: { follower_count: 1 },
      },
      { session }
    );
    return {
      result: true,
      success: true,
      errCode: null,
      available: "connection_rid_uid",
      options: { rid: requestedUser, uid: user_id },
    };
  },
  preCheck,
});

export const DELETE = deleteRequest(async ({ user_id, session, params }) => {
  const requestedUser = params.id;
  await Follow.findOneAndDelete(
    [
      {
        follower: user_id,
        followee: requestedUser,
      },
    ],
    { session }
  );
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
    available: "connection_rid_uid",
    options: { rid: requestedUser, uid: user_id },
    files: [],
  };
});
