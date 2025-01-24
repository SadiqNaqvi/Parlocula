import { mediaUploader } from "@lib/actions";
import { connectPPDB } from "@lib/database";
import { externalLinkSchema, imageSchema, mediaSchema } from "@lib/schemas";
import { formDataToObject, getUser } from "@lib/utils";
import Thread from "@model/threads_model";
import ThreadUserLink from "@model/members";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const zodThreadSchema = z.object({
  title: z
    .string()
    .min(5, "Title must contain 5 characters.")
    .max(25, "Title cannot have more than 25 characters."),
  description: z
    .string()
    .min(15, "Description must have 15 characters.")
    .max(500, "Description cannot have more than 500 characters."),
  nsfw: z.boolean(),
  links: z.array(externalLinkSchema),
  media: mediaSchema.nullable().optional(),
  file: imageSchema.nullable().optional(),
  created_by: z.string(),
});

export const POST = async (req: NextRequest) => {
  const user = getUser();
  if (!user)
    return NextResponse.json(
      {
        response: null,
        error: "Unauthorized! You need to log-in to create a thread.",
        success: false,
      },
      { status: 402 }
    );

  const response = await req.formData();

  const formDataObject = formDataToObject(response);

  const threadID = { id: null };

  const parsed = zodThreadSchema.safeParse(formDataObject);
  if (!parsed.success)
    return NextResponse.json(
      { response: null, error: parsed.error.errors, success: false },
      { status: 400 }
    );

  const { data } = parsed;
  const { media, title, description, links, nsfw, file } = data;

  try {
    const fileRes = file
      ? await mediaUploader(file, {
          format: "webp",
          resource_type: media?.type || "auto",
        })
      : null;
    if (fileRes && !fileRes.success)
      return NextResponse.json(
        { response: null, error: fileRes.error, success: false },
        { status: 500 }
      );

    const fileId = fileRes ? fileRes.result.public_id : "";

    const dataToStore = {
      title,
      created_by: user._id,
      description,
      nsfw,
      links,
      poster: fileId || media?.url || "",
    };
    await connectPPDB();
    const resp = await Thread.create(dataToStore);
    threadID.id = resp._id;
    await ThreadUserLink.create({
      thread_id: resp._id,
      user_id: user._id,
      user_role: "creator",
    });
  } catch (err) {
    console.error("Failed to create thread: " + err);
    return NextResponse.json(
      { response: null, error: err, success: false },
      { status: 500 }
    );
  }
  revalidatePath("/threads");
  threadID.id ? redirect(`/threads/${threadID.id}`) : redirect(`/threads`);
};
