import { cookies } from "next/headers";
import { generateToken, getSession, verifyToken } from "@lib/auth";
import { UserData } from "@model/users";
import { NextRequest, NextResponse } from "next/server";
import { connectPPDB } from "@lib/database";
import { isValidObjectId } from "mongoose";
import { ObjectId } from "mongodb";

const getUserFromId = async (id: string) => {
  const userid = new ObjectId(id);
  const isDbConnected = await connectPPDB();
  if (!isDbConnected) return null;

  console.log("Db Connected at 24");
  const user = await UserData.findOne({
    user_id: userid,
  }).populate("user_id", "name username dob profile createdAt");

  if (!user) return null;

  const { user_id, celebs, watch, genres, email } = user;
  const { _id, name, username, dob, profile, createdAt } = user_id;
  return {
    _id,
    name,
    username,
    dob,
    profile,
    email,
    createdAt,
    celebs,
    watch,
    genres,
  };
};

export const GET = async (req: NextRequest) => {
  console.count("AAYA YAHA 🥱🥱🥱");
  console.log("req cookies", req.cookies);
  const token = cookies().get("token");
  console.log("token", token);
  if (!token) return NextResponse.json({ result: null });

  try {
    const payload = verifyToken(token.value);
    // console.log("payload", payload);

    if (typeof payload === "string" || !payload.exp)
      return NextResponse.json({ result: null });

    if (!payload.user_id || !isValidObjectId(payload.user_id))
      return NextResponse.json({
        result: null,
        error: "Invalid Id! Please log in again.",
        success: false,
      });

    const user = await getUserFromId(payload.user_id);
    // console.log("user aaya", user);
    if (!user || payload.exp * 1000 > Date.now())
      return NextResponse.json({ result: user });

    const session = await getSession(payload.user_id);
    console.log("session", session);
    if (!session) return NextResponse.json({ result: null });

    generateToken({
      user_id: user._id,
      dob: user.dob,
    });

    return NextResponse.json({ result: user });
  } catch (err) {
    console.log("Unable to get user:", err);
    return NextResponse.json({ result: null });
  }
};
