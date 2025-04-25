import { getRequest } from "@lib/helpers/common";
import { User } from "@model";

export const GET = getRequest(async (r: any, params: { username: string }) => {
  const { username } = params;

  const data = await User.findOne(
    { username },
    {
      username: 1,
      email: 1,
      followers: 1,
      following: 1,
      posts: 1,
      name: 1,
      bio: 1,
      bioLinks: 1,
      profile: 1,
    }
  );

  return {
    result: data,
    success: Boolean(data),
    errCode: data ? undefined : "pp104",
  };
});
