import { z } from "zod";
import {
  urlPattern,
  passwordValidator,
  usernamePattern,
  emailPattern,
  genresToChoose,
  postTags,
  allowedFormats,
  allowedSizes,
  numberOfFrames,
} from "./constants";
import { calculateAge, getTimeInFuture, isValidObjectId } from "./utils";

export const tagEnum = z
  .string()
  .trim()
  .refine((val) => [...postTags, ""].includes(val), {
    message: "Invalid Tag",
  });

export const tagSchema = z.object({
  tag: tagEnum,
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

export const usernameSchema = z.object({
  username: z
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
    ),
});


const dateSchema = z.string()
  .transform((val) => new Date(val).getTime())
  .refine((val) => !isNaN(val), "Invalid Date!")

const dobSchema = dateSchema
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

export const frameDataSchema = z.object({
  type: z.enum(["image", "video"]),
  isExternal: z.boolean(),
  path: z.string(),
  shouldUpload: z.boolean(),
});

export const fileSchema = z
  .any()
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
  })
  .merge(threadSchemaClient);

export const threadUpdateSchema = threadSchemaServer
  .merge(extraFieldForUpdateMethod)
  .partial();

const postRefineFunc = (data: any) => {
  const { filesData, links, tag } = data;
  if (
    tag === "frames" &&
    !(filesData.length > 0 && filesData.length < numberOfFrames.total)
  )
    return {
      path: ["custom"],
      message: `Frames based post must have at least 1 frame attached and only ${numberOfFrames.total} frames are allowed!`,
    };
  else if (tag === "links" && !(links.length > 0 && links.length < 5))
    return {
      path: ["custom"],
      message:
        "Links based post must have at least 1 link attached and only 5 links are allowed!",
    };
  else if (tag !== "frames" && filesData?.length > 1)
    return {
      path: ["custom"],
      message: "Only 1 frame is allowed to attach!",
    };
  else return true;
};

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
  tag: tagEnum.default(""),
  links: z.array(linkSchema),
  filesData: z.array(frameDataSchema).default([]),
  files: z.array(fileSchema).default([]),
  thread_id: z.string(),
  repost_id: z.string().optional(),
  repost_author: z.string().optional(),
});

export const postSchemaServer = postClientSchema
  .merge(postServerBase)
  .refine(postRefineFunc);

export const postUpdateSchema = postClientSchema
  .merge(postServerBase)
  .merge(extraFieldForUpdateMethod)
  .partial()
  .refine(postRefineFunc);

export const registerUserSchemaClient = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters long")
    .max(25, "Name cannot have more than 25 characters"),
  bio: z
    .string()
    .trim()
    .max(200, "Only 200 characters are allowed")
    .default(""),
  dob: dobSchema,
});

export const registerUserSchemaServer = z
  .object({
    username: z
      .string()
      .trim()
      .min(6, "Username must be at least 6 characters long")
      .max(20, "Username cannot have more than 20 characters")
      .refine(
        (username) => usernamePattern.test(username),
        "Username cannot start with numbers"
      ),
    email: emailSchema,
    genres: z
      .array(z.string())
      .refine(
        (val) => val.length >= 3,
        "At least 3 initial genres are required."
      )
      .refine((val) => val.length <= 5, "Only 5 genres are allowed.")
      .refine(
        (val) => val.every((el) => genresToChoose.includes(el)),
        "You can only choose between the given genres"
      ),
    bioLinks: z.array(linkSchema).default([]),
    files: z.array(fileSchema).optional().default([]),
    filesData: z.array(frameDataSchema).optional().default([]),
  })
  .merge(registerUserSchemaClient);

export const userUpdateSchema = z
  .object({
    profile: z.string().optional(),
  })
  .merge(registerUserSchemaServer)
  .merge(extraFieldForUpdateMethod)
  .partial();

export const usernameUpdateSchema = z.object({
  username: usernameSchema,
  passkey: z.string(),
});

export const emailUpdateSchema = z.object({
  username: emailSchema,
  passkey: z.string(),
});

export const verificationCodeSchema = z.object({
  code: z
    .string()
    .min(6, "Invalid code! Please enter a 6 digit code")
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val), "Invalid code! Please enter a valid code"),
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
  content: z.string().min(2).max(1000).optional(),
  post_id: z.string(),
  replied_to: z.string().optional().nullable(),
  nsfw: z.boolean().default(false),
  spoiler: z.boolean().default(false),
  attachment: z.string().optional(),
  post_author: z.string(),
  comment_author: z.string().optional(),
});

export const commentSchema = commentSchemaBase.refine((data) =>
  Boolean(data.content || data.attachment)
);

export const commentSchemaUpdate = commentSchemaBase.partial().strict();

export const voteSchema = z.object({
  type: z.enum(["up", "down"]),
  comment_author: z.string(),
});

const itemsSchema = z.array(
  z.object({
    title: z.string(),
    poster: z.string(),
    year: z.number(),
    media_type: z.enum(["movie", "show"]),
    tmdb_id: z.string(),
    isConfirm: z.boolean(),
    media_id: z.string().optional(),
  })
);

export const listClientSchema = z.object({
  name: z
    .string()
    .min(3, "Name must contain at least 3 characters")
    .max(40, "Title must contain at most 40 characters"),
  isPrivate: z.boolean(),
});

export const listServerSchema = z.object({
  name: z.string().min(3).max(40),
  isPrivate: z.boolean(),
  items: itemsSchema,
});

export const listEditSchema = z
  .object({
    itemsToDelete: z.array(z.string()).default([]),
  })
  .merge(listClientSchema)
  .partial();

export const itemsForListSchema = z.object({
  items: itemsSchema,
  list_type: z.enum(["custom", "favourite", "recommended", "watched"]),
});

export const cinementToAddAndRemove = z.object({
  tmdb_id: z.string(),
  year: z.number(),
  add: z.array(z.string()),
  remove: z.array(z.string()),
  favourite: z.enum(["added", "removed", "none"]).default("none"),
  watched: z.enum(["added", "removed", "none"]).default("none"),
  recommended: z.enum(["added", "removed", "none"]).default("none"),
});

export const bookmarkSchema = z.object({
  content_id: z.string(),
  content_type: z.enum(["Post", "Comment", "List"]),
  content_author: z.string(),
});

export const reportSchema = z
  .object({
    reason: z.string(),
    details: z.string().min(100).max(500).optional(),
    ext_id: z.string().optional(),
    content_id: z.string(),
    content_type: z.enum(["Post", "Comment", "User", "Thread"]),
  })
  .refine(
    ({ reason, details }) => Boolean(reason === "Others" && details?.length),
    { path: ["details"], message: "Details are required if 'Others' is chosen" }
  )
  .refine(({ ext_id, content_type }) => {
    if ((content_type === "Post" || content_type === "Comment") && !ext_id)
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
    poster: z.string().optional(),
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

export const reportActionSchema = z.object({
  actions: z.array(
    z.object({
      id: z.string(),
      action: z.enum(["keep", "delete", "warn"]),
    })
  )
    .min(1, "Take a decision to save")
    .max(50, "Only 50 decisions can be saved at a time"),
  type: z.enum(["post", "comment"])
});

export const sessionInvalidationSchema = z.object({
  passKey: z.string().min(10),
  date: dateSchema
    .refine(
      date => date < getTimeInFuture({ unit: "mo" }),
      "We only allow delition upto 1 month"
    )
    .optional()
});

export const sessionInvalidationSchemaServer = sessionInvalidationSchema
  .merge(z.object({ email: emailSchema }))
