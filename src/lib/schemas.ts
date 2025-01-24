import { z } from "zod";
import {
  allowedImageTypes,
  maxImageSize,
  urlPattern,
  passwordValidator,
  usernamePattern,
  emailPattern,
  genresToChoose,
  postTags,
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

export const mediaSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.string().trim().optional(),
});

export const imageSchema = z
  .any()
  .refine((file: File) => file?.size < maxImageSize)
  .refine((file: File) => allowedImageTypes.includes(file?.type));

export const threadSchemaClient = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Thread name must contain 5 characters.")
    .max(25, "Thread name cannot have more than 25 characters.")
    .refine((val) => val.includes(" "), "Thread name cannot have white spaces")
    .refine(
      (val) => usernamePattern.test(val),
      "Thread name cannot start with number and cannot have special symbols except underscore ( _ )"
    ),
  description: z
    .string()
    .trim()
    .min(15, "Description must have 15 characters.")
    .max(500, "Description cannot have more than 500 characters."),
  tags: z
    .string()
    .trim()
    .transform((tags) => tags.split(","))
    .refine((tags) => tags.length <= 10, "Only 10 tags are allowed."),
  nsfw: z.boolean(),
  links: z
    .array(linkSchema)
    .refine(
      (links) => links.length <= 1,
      "A link is required to create a thread"
    )
    .refine((links) => links.length <= 5, "Only 5 links are allowed"),
});

export const postSchemaServer = z.object({
  title: z
    .string()
    .trim()
    .min(15, "Title must contain 15 characters.")
    .max(500, "Title cannot have more than 500 characters."),
  body: z.string().trim().default(""),
  tag: tagEnum.default(""),
  nsfw: z.boolean(),
  spoiler: z.boolean(),
  links: z.array(linkSchema).optional(),
  file_type: z.enum(["image", "video"]).nullable(),
  file_url: z.string().trim().nullable(),
  file: z.any().nullable(),
});

export type PostSchemaServerType = z.infer<typeof postSchemaServer>;

export const postSchemaClient = z.object({
  title: z
    .string()
    .trim()
    .min(15, "Title must contain 15 characters.")
    .max(500, "Title cannot have more than 500 characters."),
  body: z.string().trim(),
  tag: tagEnum.default(""),
  nsfw: z.boolean(),
  spoiler: z.boolean(),
  links: z.array(linkSchema).optional(),
});

export type PostSchemaClientType = z.infer<typeof postSchemaClient>;

export const mediaPostServerSchema = z.object({
  caption: z
    .string()
    .trim()
    .max(800, "Caption cannot have more than 800 characters"),
  nsfw: z.boolean(),
  spoiler: z.boolean(),
  links: z.array(linkSchema).optional(),
  file_type: z.enum(["image", "video"]),
  file_url: z.string().trim().nullable(),
  file: z.any().nullable(),
});
export type MediaPostServerSchemaType = z.infer<typeof mediaPostServerSchema>;

export const registerUserSchemaClient = z
  .object({
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
    confirmPassword: z.string().trim(),
  })
  .refine((val) => val.password === val.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password do not match",
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

export const registerUserSchemaServer = z.object({
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
    .refine((val) => val.length >= 3, "At least 3 initial genres are required.")
    .refine((val) => val.length <= 5, "Only 5 genres are allowed.")
    .refine(
      (val) => val.every((el) => genresToChoose.includes(el)),
      "You can only choose between the given genres"
    ),
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
      "Password must have an uppercas letter, a number and one of @$!%*?&"
    ),
  file: imageSchema.nullable().optional(),
  file_type: z.string().trim().nullable().optional(),
  file_url: z.string().trim().nullable().optional(),
});
