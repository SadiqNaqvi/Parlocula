import {
  commentSchema,
  frameDataSchema,
  itemToAddAndRemove,
  linkSchema,
  listServerSchema,
  postSchemaServer,
  bookmarkSchema,
  tagSchema,
  threadSchemaServer,
} from "@lib/schemas";
import { z } from "zod";

export type TagSchemaType = z.infer<typeof tagSchema>;
export type LinkSchema = z.infer<typeof linkSchema>;
export type FrameDataSchemaType = z.infer<typeof frameDataSchema>;
export type ThreadSchemaServer = z.infer<typeof threadSchemaServer>;
export type PostSchemaType = z.infer<typeof postSchemaServer>;
export type CommentSchemaType = z.infer<typeof commentSchema>;
export type ListSchemaType = z.infer<typeof listServerSchema>;
export type ItemToAddAndRemoveType = z.infer<typeof itemToAddAndRemove>;
export type bookmarkSchemaType = z.infer<typeof bookmarkSchema>;

export type InputMediaType = {
  title: string;
  year: number;
  tmdb_id: string;
  poster: string;
  media_type: "movie" | "show";
  isConfirm: boolean;
  media_id?: string;
};

type CommanInputFrame = { path: string; type: "image" | "video" };

export type InputFrame = CommanInputFrame &
  ({ blob: null; isExternal: true } | { blob: Blob; isExternal: false });
