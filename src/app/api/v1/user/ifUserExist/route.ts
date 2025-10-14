import { getRequest } from "@lib/helpers/common";
import { emailPattern } from "@lib/constants";
import { User } from "@model";
import { NextRequest } from "next/server";

export const GET = getRequest(async (req: NextRequest) => {
  const email = req.nextUrl.searchParams.get("email");
  if (!email || !emailPattern.test(email))
    return { success: false, errCode: "invalid_input" };

  const res = await User.exists({ email });
  return { result: Boolean(res), success: true };
});
