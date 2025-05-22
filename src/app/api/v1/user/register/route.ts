import { generateToken, storeSession } from "@lib/auth";
import { predefinedLists } from "@lib/constants";
import { postRequest } from "@lib/helpers/common";
import { registerUserSchemaServer } from "@lib/schemas";
import { List, User } from "@model";
import { User as UserType } from "@type/internal";
import { UserModelType } from "@type/models";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

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

    const dataToStore = {
      name,
      bio,
      bioLinks,
      username,
      email,
      dob,
      initialGenres: genres,
      password: encryptedPassword,
      profile: frames.pop()?.path ?? "",
      session_id,
    };

    const response = await User.create([dataToStore], {
      session,
      ordered: true,
    });

    const user: UserModelType & id = response[0];
    if (!user) return { success: false, errCode: "pp105" };

    const listsToCreate = predefinedLists.map((l) => ({
      name: l,
      user_id: user._id,
      isPrivate: l !== "recommended",
      item_count: 0,
      list_type: l,
    }));

    const lists = await List.create(listsToCreate, {
      session,
      ordered: true,
    });

    const sessionStored = await storeSession(session_id, {
      user_id: user._id,
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
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profile: user.profile,
      bio: user.bio,
      dob: user.dob,
      bioLinks: user.bioLinks,
      edited_at: null,
      followers: 0,
      following: 0,
      posts: 0,
      comments: 0,
      public_lists: 0,
      predefine_lists: lists.map(({ name, _id }) => ({ name, _id })),
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
