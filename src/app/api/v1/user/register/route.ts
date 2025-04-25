import { postRequest } from "@lib/helpers/common";
import { generateToken, storeSession } from "@lib/auth";
import { registerUserSchemaServer } from "@lib/schemas";
import { List, User } from "@model";
import { UserModelType } from "@type/models";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { User as UserType } from "@type/internal";
import { preLists } from "@lib/constants";
import { Types } from "mongoose";

type id = { _id: string };

export const POST = postRequest({
  handler: async ({ data, frames, session }) => {
    const { name, dob, email, genres, password, bio, username, bioLinks } =
      data;

    const encryptedPassword = await bcrypt.hash(
      password,
      await bcrypt.genSalt(10)
    );

    const session_id = crypto.randomUUID();
    const id = new Types.ObjectId();

    const presefinedLists = preLists.map((l) => ({
      name: l,
      user_id: id,
      isPrivate: true,
      item_count: 0,
      list_type: l,
    }));

    const lists = await List.create(presefinedLists, {
      session,
      ordered: true,
    });
    const idMap = new Map(lists.map((l) => [l.name, l._id]));

    const dataToStore = {
      _id: id,
      name,
      bio,
      bioLinks,
      username,
      email,
      dob,
      genres,
      password: encryptedPassword,
      favourite_id: idMap.get("favourite"),
      recommended_id: idMap.get("recommended"),
      watched_id: idMap.get("watched"),
      profile: frames.pop()?.path ?? "",
      session_id,
    };

    const response = await User.create([dataToStore], {
      session,
      ordered: true,
    });

    const user: UserModelType & id = response[0];
    if (!user) return { success: false, errCode: "pp105" };

    const sessionStored = await storeSession(session_id, {
      user_id: id,
      username,
      email,
      isBanned: false,
    });
    if (!sessionStored) return { success: false, errCode: "pp106" };

    const token = await generateToken({ user_id: user._id, username });
    cookies().set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });
    cookies().set("sid", session_id, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    const result: UserType = {
      ...user,
      favourite_id: user.favourite_id.toString(),
      recommended_id: user.recommended_id.toString(),
      watched_id: user.watched_id.toString(),
      lists: [],
      threads: [],
    };

    return {
      result,
      success: true,
      available: "registration_email_username",
      options: { email, username },
    };
  },
  schema: registerUserSchemaServer,
});
