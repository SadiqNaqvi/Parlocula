import { z } from "zod";
import {
  allowedFormats,
  allowedSizes,
  availablePostCategories,
  emailPattern,
  megaFilePattern,
  numberOfFrames,
  urlPattern,
  usernamePattern
} from "./constants";
import { calculateAge, isValidParloId } from "./utils";

export const categoryEnum = z
  .string()
  .trim()
  .refine((val) => [...availablePostCategories, ""].includes(val), {
    message: "Invalid Category",
  });

export const emailSchema = z
  .string()
  .trim()
  .min(13, "Email too short! Please provide a valid email.")
  .max(40, "Email too long! Please provide a valid email.")
  .refine(
    (email) => emailPattern.test(email),
    "Invalid Email! Please provide a valid email."
  );

export const usernameSchema = z
  .string()
  .trim()
  .min(6, "Username must be at least 6 characters long")
  .max(20, "Username cannot have more than 20 characters")
  .transform((username) => username.toLowerCase())
  .refine(
    (username) => !username.includes(" "),
    "Username cannot have white spaces"
  )
  .refine(
    (username) => usernamePattern.test(username),
    "Username can only start with alphabetical characters. Only _ is allowed as special character."
  );


export const dateSchema = z.number().or(z.string()).or(z.date())
  .transform((val) => new Date(val).getTime())
  .refine((val) => !isNaN(val), "Invalid Date!")

export const dobSchema = dateSchema
  .refine((val) => {
    const age = calculateAge(val);
    return age > 12 && age < 80;
  }, "Your age is not valid to use this app!");

export const linkSchema = z.object({
  label: z
    .string()
    .trim()
    .min(5, "Label must contain 5 characters.")
    .max(20, "Label connot have more than 20 characters."),
  path: z
    .string()
    .trim()
    .min(15, "URL must have 15 characters")
    .max(200, "URL cannot have more than 100 characters")
    .refine((url) => new RegExp(urlPattern).test(url), {
      message: "Invalid URL. Please include 'https'.",
    }),
});

export const megaFileSchema =
  z.string()
    .trim()
    .refine(url => megaFilePattern.test(url),
      "Invalid URL! Please provide a valid Mega url with id and key"
    )

export const frameDataSchema = z.object({
  type: z.enum(["image", "video"]),
  isExternal: z.boolean(),
  path: z.string(),
  shouldUpload: z.boolean().optional(),
  size: z.number(),
  hash: z.string(),
});

export const fileSchema = z
  .any()
  .refine((input) => Boolean(input instanceof File))
  .refine((file: File) => {
    const [type, ext] = file.type.split("/");
    const formats = allowedFormats[type];
    if (formats && formats.includes(ext)) return true;
    return false;
  }, "Invalid file format!")
  .refine(
    (file: File) => file.size < allowedSizes[file.type.split("/")[0]],
    "File size is too large!"
  );

export const extraFieldForUpdateMethod = z.object({
  filesToRemove: z
    .array(
      z.object({
        path: z.string(),
        type: z.enum(["image", "video"]),
      })
    )
    .default([]),
});

export const threadSchemaClient = z.object({
  name: z
    .string()
    .trim()
    .toLowerCase()
    .min(5, "Thread name must contain 5 characters.")
    .max(30, "Thread name cannot have more than 30 characters."),
  description: z
    .string()
    .trim()
    .min(15, "Description must have 15 characters.")
    .max(500, "Description cannot have more than 500 characters."),
  nsfw: z.boolean(),
});

const threadConnectionSchema = z.object({
  type: z.enum(["person", "movie", "show"]),
  path: z.string(),
  name: z.string(),
});

export const threadSchemaServer = z
  .object({
    _id: z.string(),
    connections: z
      .array(threadConnectionSchema)
      .refine(
        (c) => c.length >= 1,
        "A connection is required to create a thread"
      )
      .refine((c) => c.length <= 10, "At most 10 connections are allowed"),
    links: z
      .array(linkSchema)
      .refine((l) => l.length <= 5, "At most 5 links are allowed"),
    filesData: z.array(frameDataSchema).optional().default([]),
    files: z.array(fileSchema).optional().default([]),
  }).merge(threadSchemaClient);

export const threadUpdateSchema = threadSchemaServer
  .merge(extraFieldForUpdateMethod)
  .partial();

export const postClientSchema = z.object({
  title: z
    .string()
    .trim()
    .min(15, "Title must contain 15 characters.")
    .max(500, "Title must contain at most 500 characters."),
  body: z
    .string()
    .trim()
    .max(5000, "Body must contain at most 5000 characters."),
  nsfw: z.boolean(),
  spoiler: z.boolean(),
});

const postServerBase = z.object({
  _id: z.string(),
  category: categoryEnum.default(""),
  links: z.array(linkSchema),
  filesData: z.array(frameDataSchema).max(numberOfFrames.total).default([]),
  files: z.array(fileSchema).max(numberOfFrames.total).default([]),
  thread_id: z.string(),
  quoted_post_id: z.string().optional(),
  quoted_post_author: z.string().optional(),
});

export const postSchemaServer = postClientSchema
  .merge(postServerBase);

export const postUpdateSchema = postClientSchema
  .merge(postServerBase)
  .partial()
  .merge(extraFieldForUpdateMethod);

export const registerUserSchemaClient = z.object({
  name: z
    .string()
    .trim()
    .default(""),
  // .refine((name) => {
  //   if (!name) return true;
  //   else if (name.length > 25)
  //     return "Name cannot have more than 25 characters";
  // }),
  bio: z
    .string()
    .trim()
    .max(200, "Only 200 characters are allowed")
    .default(""),
});

export const registerUserSchemaServer = z
  .object({
    dob: dobSchema,
    username: usernameSchema,
    email: emailSchema,
    bioLinks: z.array(linkSchema).default([]),
    files: z.array(fileSchema).optional().default([]),
    filesData: z.array(frameDataSchema).optional().default([]),
  })
  .merge(registerUserSchemaClient);

export const userUpdateSchema = z.object({
  bioLinks: z.array(linkSchema).optional(),
  files: z.array(fileSchema).optional().default([]),
  filesData: z.array(frameDataSchema).optional().default([]),
})
  .merge(registerUserSchemaServer)
  .merge(extraFieldForUpdateMethod)
  .partial();

export const verificationCodeSchema = z
  .string()
  .min(6, "Invalid code! Please enter a 6 digit code")
  .transform((val) => parseInt(val))
  .refine((val) => !isNaN(val), "Invalid code! Please enter a valid code");

export const verifyCodeToLoginSchema = z.object({
  code: verificationCodeSchema
})

export const usernameUpdateSchema = z.object({
  username: usernameSchema,
  passkey: z.string(),
  fingerprint: z.string()
});

export const emailUpdateSchema = z.object({
  email: emailSchema,
  passkey: z.string(),
  code: verificationCodeSchema,
  fingerprint: z.string()
});

export const userPrefrenceSchema = z
  .record(z.boolean())
  .transform((val) => Object.keys(val).filter((el) => val[el]))
  .refine((arr: string[]) => arr.length >= 3, {
    path: ["custom"],
    message: "At least 3 initial genres are required",
  })
  .refine((arr: string[]) => arr.length <= 5, {
    path: ["custom"],
    message: "Only 5 genres are allowed",
  });

const commentSchemaBase = z.object({
  _id: z.string(),
  content: z.string().min(2).max(1000).default(""),
  post_id: z.string(),
  nsfw: z.boolean().default(false),
  spoiler: z.boolean().default(false),
  attachment: z.string().default(""),
  post_author: z.string(),
  comment_author: z.string().optional(),
  replied_to: z.string().optional(),
});

export const commentSchema = commentSchemaBase.refine((data) =>
  Boolean(data.content || data.attachment)
);

export const commentSchemaUpdate = commentSchemaBase.partial().strict();

export const likeSchema = z.object({
  comment_author: z.string(),
});

const itemBaseSchema = z.object({
  title: z.string(),
  poster: z.string(),
  year: z.number(),
  cinement_type: z.enum(["movie", "show"]),
  ext_id: z.string(),
  cinement_id: z.string(),
})

const confirmedItemExt = z.object({
  isConfirm: z.literal(true),
});

const unconfirmedItemExt = z.object({
  isConfirm: z.literal(false),
});

export const itemSchema = z.union([
  itemBaseSchema.and(confirmedItemExt),
  itemBaseSchema.and(unconfirmedItemExt)
]);

export const shelfClientSchema = z.object({
  name: z
    .string()
    .min(3, "Name must contain at least 3 characters")
    .max(40, "Title must contain at most 40 characters"),
  isPrivate: z.boolean(),
});

export const shelfServerSchema = z.object({
  name: z.string().min(3).max(40),
  isPrivate: z.boolean(),
  items: z.array(itemSchema),
});

export const shelfEditSchema = z
  .object({
    itemsToDelete: z.array(z.string()).default([]),
  })
  .merge(shelfClientSchema)
  .partial();

export const itemsForShelfSchema = z.object({
  items: z.array(itemSchema),
  shelf_type: z.enum(["custom", "favourite", "recommended", "watched"]),
});

export const cinementToAddAndRemove = z.object({
  ext_id: z.string(),
  year: z.number(),
  add: z.array(z.string()),
  remove: z.array(z.string()),
  favourite: z.enum(["added", "removed", "none"]).default("none"),
  watched: z.enum(["added", "removed", "none"]).default("none"),
  recommended: z.enum(["added", "removed", "none"]).default("none"),
});

export const bookmarkSchema = z.object({
  content_id: z.string(),
  content_type: z.enum(["Post", "Comment", "Shelf"]),
  content_author: z.string(),
});

export const reportSchema = z
  .object({
    reason: z.string(),
    details: z.string().min(100).max(500).optional(),
    ext_id: z.string().optional(),
    content_id: z.string(),
    content_type: z.enum(["post", "comment", "user", "thread"]),
  })
  .refine(
    ({ reason, details }) => Boolean(reason === "Others" && details?.length),
    { path: ["details"], message: "Details are required if 'Others' is chosen" }
  )
  .refine(({ ext_id, content_type }) => {
    if ((content_type === "post" || content_type === "comment") && !ext_id)
      return false;
    return true;
  });

export const messageSchema = z.object({
  _id: z.string(),
  content: z.string().min(1).max(3000),
  createdAt: z.number(),
  username: z.string(),
  replied_to: z.string().optional(),
  replied_content: z.string().optional(),
  room: z.object({
    display_name: z.string(),
    poster: frameDataSchema.optional(),
    mute: z.boolean(),
  })
});

export const roomSchemaClient = z.object({
  name: z.string().max(50),
  inviteMessage: z.string().min(3).max(1000),
})

export const roomSchema = z
  .object({
    type: z.enum(["private", "group"]),
    participants: z
      .array(z.string())
      .refine(
        (p) => p.length > 0,
        "Choose atleast 1 participant to start chatting"
      ).refine(p => p.length <= 50,
        "Only 50 participants are allowed to add in a group for now"
      ),
    name: z.string().optional(),
    filesData: z.array(frameDataSchema).optional().default([]),
    files: z.array(fileSchema).optional().default([]),
    inviteMessage: z.string(),
  })
  .refine(({ type, name, participants }) => {
    if (type === "private") return true;
    else if (participants.length < 3)
      return { path: "custom", message: "At least 3 participants are required to create a group" };
    else if (!name)
      return { path: "name", message: "Name of the group is required" };
  });

export const roomUpdateSchema = z.object({
  name: z.string(),
  files: z.array(fileSchema).default([]),
  filesData: z.array(frameDataSchema).optional().default([]),
})
  .partial()
  .merge(extraFieldForUpdateMethod)

export const reportActionSchema = z.object({
  actions: z.array(
    z.object({
      id: z.string(),
      action: z.enum(["keep", "delete", "warn"]),
    })
  )
    .min(1, "Take at least one decision")
    .max(50, "Only 50 decisions can be taken at a time"),
  type: z.enum(["post", "comment"])
});

export const sessionInvalidationSchema = z.object({
  passKey: z.string().min(10)
});

export const sessionInvalidationSchemaServer = sessionInvalidationSchema
  .merge(z.object({ email: emailSchema }))

export const createArrayOfUidsSchema = (limit: number) => z.object({
  users: z
    .array(z.string())
    .refine(
      (a) => a.length > 0 && a.length <= limit,
      `At least one and upto ${limit} users should be selected.`
    )
    .refine((a) => a.every((u) => isValidParloId(u)), {
      path: ["custom"],
      message: "user id is invalid! Please re-select and try again"
    }),
});
