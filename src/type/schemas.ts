import {
  bookmarkSchema,
  cinementToAddAndRemove,
  commentSchema,
  commentSchemaUpdate,
  emailUpdateSchema,
  frameDataSchema,
  itemSchema,
  itemsForShelfSchema,
  linkSchema,
  shelfEditSchema,
  shelfServerSchema,
  messageSchema,
  postSchemaServer,
  postUpdateSchema,
  registerUserSchemaClient,
  registerUserSchemaServer,
  reportActionSchema,
  reportSchema,
  roomSchema,
  sessionInvalidationSchemaServer,
  threadSchemaServer,
  threadUpdateSchema,
  usernameUpdateSchema,
  userUpdateSchema,
  likeSchema,
  roomUpdateSchema
} from "@lib/schemas";
import { z } from "zod";

export type LinkSchema = z.infer<typeof linkSchema>;
export type FrameDataSchemaType = z.infer<typeof frameDataSchema>;
export type ReportSchemaType = z.infer<typeof reportSchema>;

export type ThreadSchemaServer = z.infer<typeof threadSchemaServer>;
export type ThreadUpdateSchema = z.infer<typeof threadUpdateSchema>;

export type PostSchemaType = z.infer<typeof postSchemaServer>;
export type PostUpdateSchemaType = z.infer<typeof postUpdateSchema>;

export type CommentSchemaUpdateType = z.infer<typeof commentSchemaUpdate>;
export type CommentSchemaType = z.infer<typeof commentSchema>;

export type ShelfSchemaType = z.infer<typeof shelfServerSchema>;
export type ShelfEditSchemaType = z.infer<typeof shelfEditSchema>;
export type CinementToAddAndRemoveType = z.infer<typeof cinementToAddAndRemove>;
export type itemsForShelfSchemaType = z.infer<typeof itemsForShelfSchema>;

export type BookmarkSchemaType = z.infer<typeof bookmarkSchema>;

export type LikeSchemaType = z.infer<typeof likeSchema>;

export type UserSchemaType = z.infer<typeof registerUserSchemaServer>;
export type UserUpdateSchemaType = z.infer<typeof userUpdateSchema>;
export type RegisterSchemaClientType = z.infer<typeof registerUserSchemaClient>;

export type RoomSchemaType = z.infer<typeof roomSchema>;
export type RoomUpdateSchemaType = z.infer<typeof roomUpdateSchema>;
export type MessageSchemaType = z.infer<typeof messageSchema>;

export type ReportActionSchemaType = z.infer<typeof reportActionSchema>

export type SessionInvalidationServerSchemaType = z.infer<typeof sessionInvalidationSchemaServer>

export type UsernameUpdateSchemaType = z.infer<typeof usernameUpdateSchema>;
export type EmailUpdateSchemaType = z.infer<typeof emailUpdateSchema>;

type CommanInputFrame = {
  path: string;
  type: "image" | "video";
  shouldUpload: boolean;
  size: number;
  hash: string;
};

export type ThreadConnectionType = {
  type: "person" | "movie" | "show";
  path: string;
  name: string;
};

export type InputFrame = CommanInputFrame &
  ({ blob: null; isExternal: true } | { blob: Blob; isExternal: false });

export type CinementSchemaType = z.infer<typeof itemSchema>

export type AvailableActionsForReport = "keep" | "delete" | "warn"

export type ReportTypeEnum = "post" | "comment" | "user" | "thread";