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
import { calculateAge } from "./utils";

export const tagEnum = z
  .string()
  .trim()
  .refine((val) => postTags.includes(val), {
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

const dobSchema = z
  .string()
  .trim()
  .min(10, "Date of birth is required")
  .transform((val) => new Date(val))
  .refine((val) => val.getTime && !isNaN(val.getTime()), "Invalid Date!")
  .refine((val: Date) => {
    const age = calculateAge(val);
    return age > 12 && age < 80;
  }, "Your age is not valid to use this app!");

export type TagSchemaType = z.infer<typeof tagSchema>;

export const linkSchema = z.object({
  label: z
    .string()
    .trim()
    .min(5, "Label must contain 5 characters.")
    .max(20, "Label connot have more than 20 characters."),
  url: z
    .string()
    .trim()
    .min(15, "URL must have 15 characters")
    .max(200, "URL cannot have more than 100 characters")
    .refine((url) => new RegExp(urlPattern).test(url), {
      message: "Invalid URL. Please include 'https'.",
    }),
});

export type LinkSchema = z.infer<typeof linkSchema>;

export const frameDataSchema = z.object({
  type: z.enum(["image", "video"]),
  size: z.number(),
  isExternal: z.boolean(),
  url: z.string(),
});

export type FrameDataSchemaType = z.infer<typeof frameDataSchema>;

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
  oldFiles: z.array(frameDataSchema).optional(),
});

export const threadSchemaClient = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Thread name must contain 5 characters.")
    .max(25, "Thread name cannot have more than 25 characters.")
    .refine(
      (val) => val.includes(" "),
      "Thread name cannot have white spaces, use underscores ( _ )"
    )
    .refine(
      (val) => usernamePattern.test(val),
      "Thread name cannot start with number and cannot have special symbols except underscore ( _ )"
    ),
  description: z
    .string()
    .trim()
    .min(15, "Description must have 15 characters.")
    .max(500, "Description cannot have more than 500 characters."),
  nsfw: z.boolean(),
  tags: z
    .string()
    .trim()
    .transform((tags) => tags.split(","))
    .refine((tags) => tags.length <= 10, "Only 10 tags are allowed.")
    .transform((tags) => tags.map((tag) => tag.trim().toLowerCase())),
  links: z
    .array(linkSchema)
    .refine(
      (links) => links.length <= 1,
      "A link is required to create a thread"
    )
    .refine((links) => links.length <= 5, "Only 5 links are allowed"),
});

export const threadSchemaServer = z
  .object({
    filesData: z.array(frameDataSchema).optional(),
    files: z.array(fileSchema).optional(),
  })
  .merge(threadSchemaClient);

export type ThreadSchemaServer = z.infer<typeof threadSchemaServer>;

const postClientSuperRefine = (data: any, ctx: any) => {
  const { title, body, tag } = data;

  const validations: {
    path: string;
    label: string;
    addMsg: string;
    max: number;
  }[] = [];

  if (tag === "frames" || tag === "links") {
    if (title?.length > 300)
      validations.push({
        label: "Title",
        max: 300,
        addMsg: " for frames or links based post.",
        path: "title",
      });
    else if (body?.length > 1000)
      validations.push({
        label: "Body",
        max: 1000,
        addMsg: " for frames or links based post.",
        path: "body",
      });
  } else {
    if (title?.length > 500)
      validations.push({
        label: "Title",
        max: 500,
        addMsg: "",
        path: "title",
      });
    else if (body?.length > 5000)
      validations.push({
        label: "Body",
        max: 5000,
        addMsg: " for frames or links based post.",
        path: "body",
      });
  }
  validations.forEach((v) => {
    ctx.addIssue({
      code: "too_big",
      path: [v.path],
      maximum: v.max,
      inclusive: true,
      type: "string",
      message: `${v.label} should not have more than ${v.max} characters`,
    });
  });
};

const postServerSuperRefine = (data: any, ctx: any) => {
  const { filesData, links, tag } = data;
  if (
    tag === "frames" &&
    !(filesData.length > 0 && filesData.length < numberOfFrames.total)
  ) {
    ctx.addIssue({
      inclusive: true,
      type: "array",
      code: "too_big",
      maximum: numberOfFrames.total,
      path: ["custom"],
      message: `Frames based post must have at least 1 frame attached and only ${numberOfFrames.total} frames are allowed!`,
    });
  } else if (tag === "links" && !(links.length > 0 && filesData.length < 5)) {
    ctx.addIssue({
      inclusive: true,
      type: "array",
      code: "too_big",
      maximum: 5,
      path: ["custom"],
      message:
        "Links based post must have at least 1 link attached and only 5 links are allowed!",
    });
  } else if (filesData?.length > 1) {
    ctx.addIssue({
      inclusive: true,
      type: "array",
      code: "too_big",
      maximum: 1,
      path: ["custom"],
      message: "Only 1 frame is allowed to attach!",
    });
  }
};

const postClientBase = z.object({
  title: z.string().trim().min(15, "Title must contain 15 characters."),
  body: z.string().trim(),
  tag: tagEnum.default(""),
  nsfw: z.boolean(),
  spoiler: z.boolean(),
});

export const postSchemaClient = postClientBase.superRefine(
  postClientSuperRefine
);

const postServerBase = z.object({
  links: z.array(linkSchema),
  filesData: z.array(frameDataSchema),
  files: z.array(fileSchema),
  thread_id: z.string(),
});

export const postSchemaServer = postClientBase
  .merge(postServerBase)
  .superRefine(postClientSuperRefine)
  .superRefine(postServerSuperRefine);

export type PostSchemaType = z.infer<typeof postSchemaServer>;

export const postUpdateSchema = postClientBase
  .merge(postServerBase)
  .merge(extraFieldForUpdateMethod)
  .partial()
  .superRefine(postClientSuperRefine)
  .superRefine(postServerSuperRefine);

const registerUserCommon = z.object({
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
  password: z
    .string()
    .trim()
    .min(8, "Password must be 8 characters long")
    .max(20, "Password cannot have more than 20 characters")
    .refine(
      (pwrd) => passwordValidator.test(pwrd),
      "Password must have an uppercase letter, a number and one of @$!%*?&"
    ),
});

export const registerUserSchemaClient = z
  .object({
    confirmPassword: z.string().trim(),
  })
  .merge(registerUserCommon)
  .refine((val) => val.password === val.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password do not match",
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
    files: z.array(fileSchema).optional(),
    filesData: z.array(frameDataSchema).optional(),
  })
  .merge(registerUserCommon);

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
});

export const commentSchema = commentSchemaBase.refine(
  (data) => data.content || data.attachment
);

export type CommentSchemaType = z.infer<typeof commentSchema>;

export const commentSchemaUpdate = commentSchemaBase.partial().strict();

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
  title: z.string().min(3).max(40),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean(),
});

export const listServerSchema = z.object({
  title: z.string().min(3).max(40),
  description: z.string().max(500).optional(),
  files: z.array(fileSchema),
  filesData: z.array(frameDataSchema),
  isPrivate: z.boolean(),
  items: itemsSchema.optional().default([]),
});

export type ListSchemaType = z.infer<typeof listServerSchema>;

export const itemsForListSchema = z.object({ items: itemsSchema });

export const itemToAddAndRemove = z.object({
  tmdb_id: z.string(),
  year: z.number(),
  add: z.array(z.string()),
  remove: z.array(z.string()),
});

export type ItemToAddAndRemoveType = z.infer<typeof itemToAddAndRemove>;
