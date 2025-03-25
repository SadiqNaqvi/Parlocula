import { getRequest } from "@lib/actions/actions";
import { emailPattern } from "@lib/constants";
import { User } from "@model";
import { NextRequest } from "next/server";

export const GET = getRequest(async (req: NextRequest) => {
  const email = req.nextUrl.searchParams.get("email");
  if (!email || !emailPattern.test(email))
    return {
      success: false,
      result: null,
      errCode: "pp205",
    };

  const res = await User.exists({ email });
  return { result: !!res, success: true, errCode: null };
});
