import WelcomeEmail from "@components/EmailTemplates/welcome";
import { generateToken, storeSession } from "@lib/auth";
import { parloculaAppURL, predefinedShelves } from "@lib/constants";
import { postHandler } from "@lib/helpers/handlers";
import { sendEmail } from "@lib/helpers/server";
import { registerUserSchemaServer } from "@lib/schemas";
import { Shelf, User } from "@model";
import { render } from "@react-email/components";
import { TokenPayload, CurrentUser } from "@type/internal";
import { PredefinedShelves } from "@type/models";
import { UserSchemaType } from "@type/schemas";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

export const POST = postHandler<UserSchemaType>({
  handler: async ({ data, frames, session, isNsfw }) => {
    const { name, dob, email, bio, username, bioLinks } = data;

    const passkey = crypto.randomUUID().split("-").join("");
    const encryptedPasskey = await bcrypt.hash(
      passkey,
      await bcrypt.genSalt(10)
    );

    const session_id = crypto.randomUUID();

    const response = await User.create([{
      name,
      bio,
      bioLinks,
      username,
      email,
      dob,
      passkey: encryptedPasskey,
      profile: frames[0],
      session_id,
      filterContent: true,

    }], {
      session,
      ordered: true,
    });

    const user = response[0].toObject();
    if (!user) return { success: false, errCode: "data_storing_fail" };

    const shelvesToCreate = predefinedShelves.map((s) => ({
      name: s,
      user_id: user._id,
      isPrivate: s !== "recommended",
      shelfKey:
        s === "recommended" ? undefined : crypto.randomUUID().split("-").join(""),
      item_count: 0,
      shelf_type: s,
    }));

    const shelves = await Shelf.create(shelvesToCreate, {
      session,
      ordered: true,
    });

    const user_id = user._id;

    const tokenPayload: TokenPayload & { email: string } = {
      user_id,
      username,
      email,
      isBanned: false,
      banEndsAt: undefined,
      profile: user.profile,
      filterContent: true,
      dob,
    }

    const sessionStored = await storeSession(session_id, tokenPayload);

    if (!sessionStored) return { success: false, errCode: "session_store_fail" };

    const token = await generateToken(tokenPayload);

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

    const template = await render(WelcomeEmail({ passkey }));

    await sendEmail({ email, template, subject: "Welcome to Parlocula" });

    const result: CurrentUser = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profile: user.profile,
      bio: user.bio,
      dob: user.dob,
      bioLinks: user.bioLinks,
      edited_at: undefined,
      followers: 0,
      following: 0,
      posts: 0,
      comments: 0,
      publicShelves: 0,
      predefinedShelves: shelves.map(({ name, _id, poster, shelf_type, isPrivate, last_added, shelfKey }) => ({
        name: name as PredefinedShelves,
        _id: _id.toString(),
        poster,
        shelf_type,
        isPrivate,
        last_added,
        shelfKey,
      })),
      filterContent: true,
      tempBanned: 0,
    };

    return {
      result,
      success: true,
      available: "registration_email_username",
      options: { email, username },
      warnTeamParlocula: isNsfw ? {
        title: "The Profile Picture of this user may be NSFW",
        desc: "",
        path: `${parloculaAppURL}/u/${user.username}`
      } : undefined,
    };
  },
  schema: registerUserSchemaServer,
  skipUserCheck: true,
});
