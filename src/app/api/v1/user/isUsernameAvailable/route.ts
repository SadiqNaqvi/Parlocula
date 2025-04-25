import { getRequest } from "@lib/helpers/common";
import { usernamePattern } from "@lib/constants";
import { User } from "@model";
import { NextRequest } from "next/server";

export const GET = getRequest(async (req: NextRequest) => {
  const username = req.nextUrl.searchParams.get("username");
  if (!username || !usernamePattern.test(username))
    return {
      result: null,
      success: false,
      errCode: "pp205",
    };

  const resp = await User.exists({ username });
  return { result: !resp, errCode: null, success: true };
});
