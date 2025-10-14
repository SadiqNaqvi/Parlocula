import { HydratedDocument } from "mongoose";
import { CreateOptions, Model } from "mongoose";
import { Types } from "mongoose";
import { GenericDate } from "./internal";

type ObjectId = Types.ObjectId | string;

export type StringifyObjecId = ObjectId

export type MongooseModel<T = any> = Model<T, T, T, T, T, T>;

export interface StrictModel<T> extends Model<T> {
  create(
    docs: Array<T>,
    options: CreateOptions & { aggregateErrors: true }
  ): Promise<(any | Error)[]>;
  create(
    docs: Array<T>,
    options?: CreateOptions
  ): Promise<HydratedDocument<T>[]>;
  create(doc: T): Promise<HydratedDocument<T>>;
  create(...docs: Array<T>): Promise<HydratedDocument<T>[]>;
}

export type ReportModelType = {
  user_id: ObjectId;
  ext_id?: ObjectId;
  reason: string;
  details?: string;
  content_id: ObjectId;
  content_type: string;
};

export type LinkModelType = {
  label: string;
  path: string;
};

export type ConnectionModelType = {
  type: string;
  path: string;
  name: string;
};

export type FrameModelType = {
  path: string;
  type: "image" | "video";
  isExternal: boolean;
};

export type UserModelType = {
  name: string;
  username: string;
  email: string;
  dob: GenericDate;
  bio: string;
  bioLinks: LinkModelType[];
  profile: string;

  edited_at?: GenericDate | null;
  isActive?: boolean;
  passkey: string;
  usernameUpdatedAt?: GenericDate | null;
  emailUpdatedAt?: GenericDate | null;

  session_id: string;
  lastLoginAt?: GenericDate;
  isBanned?: boolean;
  banEndsAt?: GenericDate | null;
  tempBanned?: number;
  followers?: number;
  following?: number;
  posts?: number;
  comments?: number;
  public_lists?: number;
};

export type UserRecommendationModelType = {
  user_id: ObjectId;
  genres: string[];
  favourite: string[];
  recommended: string[];
  watched: string[];
};

export type ThreadModelType = {
  connection: ConnectionModelType[];
  description: string;
  links: LinkModelType[];
  name: string;
  nsfw: boolean;
  poster: string;
  created_by: ObjectId;
  edited_at: GenericDate;
  edited_by: ObjectId | null;
  post_count: number;
  member_count: number;
};

export type PostModelType = {
  title: string;
  body: string;
  tag: string;
  links: LinkModelType[];
  frames: FrameModelType[];
  nsfw: boolean;
  spoiler: boolean;
  thread_id: ObjectId;
  user_id: ObjectId;
  repost_id: ObjectId;
  edited_at: GenericDate;
  reaction_count: number;
  comment_count: number;
  saved_count: number;
  createdAt: GenericDate;
};

export type CommentModelType = {
  content?: string;
  attachment?: string;
  replied_to?: ObjectId | null;
  post_id: ObjectId;
  user_id: ObjectId;
  spoiler: boolean;
  nsfw: boolean;
  upvote_count?: number;
  edited_at?: GenericDate | null;
  saved_count?: number;
  createdAt?: GenericDate;
};

export type MemberModelType = {
  thread_id: ObjectId;
  user_id: ObjectId;
  notification: boolean;
  banned: boolean;
  role: "moderator" | "member" | "moderator_invitee";
  actionsTaken: number,
};

export type ReactionModelType = {
  reaction: string;
  user_id: ObjectId;
  post_id: ObjectId;
};

export type VoteModelType = {
  type: "up" | "down";
  user_id: ObjectId;
  comment_id: ObjectId;
};

export type UserConnectionModelType = {
  follower: ObjectId;
  followee: ObjectId;
  blocked: boolean;
  notification: boolean;
};

export type CinementModelType = {
  title: string;
  poster: string;
  year: number;
  media_type: "movie" | "show";
  tmdb_id: string;
  favourite?: number;
  watched?: number;
  recommended?: number;
};

export type PreDefinedListType = "favourite" | "recommended" | "watched";
export type AllListType = PreDefinedListType | "custom";

export type ListModelType = {
  name: string;
  poster?: string;
  user_id: ObjectId;
  invitees?: ObjectId[];
  collaborators?: ObjectId[];
  isPrivate: boolean;
  listKey?: string;
  last_added?: GenericDate;
  item_count?: Number;
  list_type: AllListType;
  saved_count?: number;
  createdAt?: GenericDate;
};

export type ListItemModelType = {
  media_id: ObjectId;
  list_id: ObjectId;
  user_id: ObjectId;
  tmdb_id: string;
  year: number;
  createdAt?: GenericDate;
};

export type BookmarkModelType = {
  user_id: ObjectId;
  content_id: ObjectId;
  content_type: "Post" | "Comment" | "List";
  createdAt: GenericDate;
};

export type NotificationModelType = {
  title: string;
  message: (
    | { type: "text"; text: string }
    | { type: "link"; label: string; path: string }
  )[];
  path?: string;
  user_id: ObjectId;
  metadata?: Record<string, any>;
  type?: "request" | "informative";
  status?: "pending" | "accepted" | "denied";
  request_type?: "manager_invitation" | "collaborator_invitation";
  createdAt?: GenericDate;
};

export type RoomModelType = {
  _id: ObjectId;
  participants?: ObjectId[]; // Only filled if room type is private
  type: "private" | "group";
  name: string | undefined;
  poster: string | undefined;
  lastMessage: string;
  lastMessageAt: GenericDate;
  lastMessageBy: ObjectId;
  invitationMessage: {
    content: string;
    user_id: ObjectId;
    username: string;
    createdAt: GenericDate;
  };
};

export type ParticipantModelType = {
  user_id: ObjectId;
  room_id: ObjectId;
  seenAt: GenericDate;
  hideAt: GenericDate;
  mute: boolean;
  type: "participant" | "invitee" | "creator";
};

export type MessageModelType = {
  _id: ObjectId;
  username: string;
  user_id: ObjectId;
  room_id: ObjectId;
  content: string;
  createdAt: GenericDate;
  replied_to?: string;
  replied_content?: string;
};
