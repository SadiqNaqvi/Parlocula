import { getRequest } from "@lib/actions/actions";
import { UserData } from "@model";

export const GET = getRequest(async (r: any, params: { username: string }) => {
  const { username } = params;

  const data = await UserData.findOne(
    { username },
    {
      username: 1,
      email: 1,
      follower_count: 1,
      following_count: 1,
      post_count: 1,
    }
  ).populate("user_id", "name bio profile");

  return {
    result: data,
    success: true,
  };
});
