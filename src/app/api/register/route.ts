import { connectPPDB } from "@lib/database";
import { mediaUploader } from "@lib/actions";
import { NextResponse, NextRequest } from "next/server";
import { registerUserSchemaServer } from "@lib/schemas";
import bcrypt from "bcrypt";
import User, { UserData } from "@model/users";
import { generateToken, storeSession } from "@lib/auth";
import { formDataToObject } from "@lib/utils";

export const POST = async (req: NextRequest) => {
  const data = await req.formData();
  const objData = formDataToObject(data);
  const parsed = registerUserSchemaServer.safeParse(objData);

  if (!parsed.success)
    return NextResponse.json(
      {
        result: null,
        error: parsed.error.errors,
        success: false,
      },
      { status: 405 }
    );

  const { file, file_url, name, dob, email, genres, password, bio, username } =
    parsed.data;

  try {
    const fileRes = file
      ? await mediaUploader(file, {
          format: "webp",
          resource_type: "image",
        })
      : null;

    if (fileRes && !fileRes.success)
      return NextResponse.json(
        { response: null, error: fileRes.error, success: false },
        { status: 502 }
      );

    const file_id = fileRes ? fileRes.result.public_id : null;
    const encryptedPassword = await bcrypt.hash(
      password,
      await bcrypt.genSalt(10)
    );

    const dataToStore = {
      name,
      bio,
      username,
      email,
      dob,
      genres,
      password: encryptedPassword,
      profile: file_id || file_url || "",
    };

    const isDbConnected = await connectPPDB();
    if (!isDbConnected)
      return NextResponse.json({
        result: null,
        success: false,
        error:
          "Database connection failed. Please check your connection and try again but if the error persists please report to us. ",
      });

    const createdUser: any = await User.create(dataToStore);
    if (!createdUser)
      return NextResponse.json({
        result: null,
        error: "Failed to store data in the database. Please try again.",
        success: false,
      });

    const udata = await UserData.create({
      user_id: createdUser._id,
      genres,
      email,
      username,
    });
    if (!udata)
      return NextResponse.json({
        result: null,
        error:
          "Unable to store your data. Please check your connection and try again but if the error persists, please report to us.",
        success: false,
      });

    const id = createdUser._id.toString();

    await storeSession(id, {
      isBanned: false,
    });
    generateToken({
      user_id: id,
      dob,
    });

    const {
      celebs,
      watch,
      followers,
      following,
      post_count,
      comments_count,
      collection_count,
      public_collection_count,
      recommendations_count,
      favourites_count,
      recently_joined,
    } = udata;
    const { _id, profile, createdAt, lastUpdatedAt } = createdUser;

    return NextResponse.json(
      {
        result: {
          _id,
          name,
          bio,
          username,
          dob,
          profile,
          email,
          lastUpdatedAt,
          createdAt,
          celebs,
          watch,
          genres,
          followers,
          following,
          post_count,
          comments_count,
          collection_count,
          public_collection_count,
          recommendations_count,
          favourites_count,
          recently_joined,
        },
        error: "",
        success: true,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.log("Error occured while regestering user:", err);
    return NextResponse.json({
      result: null,
      error:
        "Something went wrong! Please check your connection and try again.",
      success: false,
    });
  }
};
