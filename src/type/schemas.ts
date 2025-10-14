import {
  bookmarkSchema,
  cinementToAddAndRemove,
  commentSchema,
  commentSchemaUpdate,
  frameDataSchema,
  linkSchema,
  listEditSchema,
  listServerSchema,
  messageSchema,
  postSchemaServer,
  postUpdateSchema,
  registerUserSchemaClient,
  registerUserSchemaServer,
  reportActionSchema,
  reportSchema,
  roomSchema,
  sessionInvalidationSchemaServer,
  tagSchema,
  threadSchemaServer,
  threadUpdateSchema,
  userUpdateSchema,
  voteSchema
} from "@lib/schemas";
import { z } from "zod";
import { MediaItemType } from "./internal";

export type TagSchemaType = z.infer<typeof tagSchema>;
export type LinkSchema = z.infer<typeof linkSchema>;
export type FrameDataSchemaType = z.infer<typeof frameDataSchema>;
export type ReportSchemaType = z.infer<typeof reportSchema>;

export type ThreadSchemaServer = z.infer<typeof threadSchemaServer>;
export type ThreadUpdateSchema = z.infer<typeof threadUpdateSchema>;

export type PostSchemaType = z.infer<typeof postSchemaServer>;
export type PostUpdateSchemaType = z.infer<typeof postUpdateSchema>;

export type CommentSchemaUpdateType = z.infer<typeof commentSchemaUpdate>;
export type CommentSchemaType = z.infer<typeof commentSchema>;

export type ListSchemaType = z.infer<typeof listServerSchema>;
export type ListEditSchema = z.infer<typeof listEditSchema>;
export type CinementToAddAndRemoveType = z.infer<typeof cinementToAddAndRemove>;

export type bookmarkSchemaType = z.infer<typeof bookmarkSchema>;

export type VoteSchemaType = z.infer<typeof voteSchema>;

export type UserSchemaType = z.infer<typeof registerUserSchemaServer>;
export type UserUpdateSchemaType = z.infer<typeof userUpdateSchema>;
export type RegisterSchemaClientType = z.infer<typeof registerUserSchemaClient>;

export type RoomSchemaType = z.infer<typeof roomSchema>;
export type MessageSchemaType = z.infer<typeof messageSchema>;

export type ReportActionSchemaType = z.infer<typeof reportActionSchema>

export type SessionInvalidationServerSchemaType = z.infer<typeof sessionInvalidationSchemaServer>

export type InputMediaType = {
  title: string;
  year: number;
  tmdb_id: string;
  poster: string;
  media_type: "movie" | "show";
  isConfirm: boolean;
  media_id?: string;
};

type CommanInputFrame = {
  path: string;
  type: "image" | "video";
  shouldUpload: boolean;
};

export type ThreadConnectionType = {
  type: "person" | "movie" | "show";
  path: string;
  name: string;
};

export type InputFrame = CommanInputFrame &
  ({ blob: null; isExternal: true } | { blob: Blob; isExternal: false });

export type CinementSchemaType = MediaItemType &
  (
    | {
      isConfirm: true;
      media_id: string;
    }
    | {
      isConfirm: false;
      media_id: undefined;
    }
  );

export type AvailableActionsForReport = "keep" | "delete" | "warn"
