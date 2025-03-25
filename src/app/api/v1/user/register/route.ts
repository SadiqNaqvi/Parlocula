import { postRequest } from "@lib/actions/actions";
import { storeSession } from "@lib/auth";
import { registerUserSchemaServer } from "@lib/schemas";
import { User, UserData } from "@model";
import { UserDataModelType, UserModelType } from "@type/modelTypes";
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
      genres,
      password: encryptedPassword,
      profile: frames.pop()?.path ?? "",
      session_id,
    };

    const createdUser: UserModelType & id = (
      await User.create([dataToStore], { session })
    )[0].toObject();

    if (!createdUser) return { success: false, errCode: "pp105" };

    const udata: UserDataModelType & id = (
      await UserData.create(
        [{
          user_id: createdUser._id,
          genres,
          email,
          username,
        }],
        { session }
      )
    )[0].toObject();

    const id = createdUser._id;

    const sessionStored = await storeSession(session_id, {
      user_id: id,
      username,
      email,
      isBanned: false,
    });
    if (!sessionStored) return { success: false, errCode: "pp106" };

    cookies().set("sid", session_id, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    const { _id, user_id, ...userData } = udata;

    return {
      result: {
        _id: id,
        follower_count: 0,
        following_count: 0,
        post_count: 0,
        bioLinks,
        bio,
        dob,
        name,
        profile: createdUser.profile,
        ...userData,
      },
      success: true,
      available: "registration_email_username",
      options: { email, username },
    };
  },
  schema: registerUserSchemaServer,
});
