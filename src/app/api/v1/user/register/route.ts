import WelcomeEmail from "@components/EmailTemplates/welcome";
import { generateToken, storeSession } from "@lib/auth";
import { predefinedLists } from "@lib/constants";
import { postRequest } from "@lib/helpers/common";
import { registerUserSchemaServer } from "@lib/schemas";
import { List, User } from "@model";
import { render } from "@react-email/components";
import { User as UserType } from "@type/internal";
import { PreDefinedListType, UserModelType } from "@type/models";
import { UserSchemaType } from "@type/schemas";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { createTransport } from "nodemailer";

type id = { _id: string };

const sendWelcomeEmail = async (passkey: string, email: string) => {
  const transportor = createTransport({
    service: "gmail",
    auth: {
      user: process.env.GOOGLE_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });
  const emailHtml = await render(WelcomeEmail({ passkey }));
  await transportor.sendMail({
    from: process.env.GOOGLE_EMAIL,
    to: email,
    subject: "Welcome to Popcorn Paragon",
    html: emailHtml,
  });
};

export const POST = postRequest<UserSchemaType>({
  handler: async ({ data, frames, session }) => {
    const { name, dob, email, bio, username, bioLinks } = data;

    const passkey = crypto.randomUUID().split("-").join("");
    const encryptedPasskey = await bcrypt.hash(
      passkey,
      await bcrypt.genSalt(10)
    );

    const session_id = crypto.randomUUID();

    const dataToStore: UserModelType = {
      name,
      bio,
      bioLinks,
      username,
      email,
      dob,
      passkey: encryptedPasskey,
      profile: frames.pop()?.path ?? "",
      session_id,
    };

    const response = await User.create([dataToStore], {
      session,
      ordered: true,
    });

    const user = response[0].toObject();
    if (!user) return { success: false, errCode: "pp105" };

    const listsToCreate = predefinedLists.map((l) => ({
      name: l,
      user_id: user._id,
      isPrivate: l !== "recommended",
      listKey:
        l === "recommended" ? undefined : crypto.randomUUID().split("-").join(""),
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

    if (!sessionStored) return { success: false, errCode: "session_store_fail" };

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

    sendWelcomeEmail(passkey, email);

    const result: UserType = {
      _id: user._id.toString(),
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
      predefine_lists: lists.map(({ name, _id }) => ({ name: name as PreDefinedListType, _id: _id.toString() })),
    };

    return {
      result,
      success: true,
      available: "registration_email_username",
      options: { email, username }
    };
  },
  schema: registerUserSchemaServer,
});
