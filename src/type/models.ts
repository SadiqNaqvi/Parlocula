import { Types } from "mongoose";

export type RecentlyJoinedModelType = {
  name: string;
  poster: string;
  thread_id: string;
};

export type ReportModelType = {
  by: Types.ObjectId;
  for: string[];
};

export type LinkModelType = {
  label: string;
  path: string;
};

export type ConnectionModelType = {
  media_type: string;
  id: string;
};

export type LastUpdateModelType = {
  connection: ConnectionModelType[];
  description: string;
  links: LinkModelType[];
  name: string;
  nsfw: boolean;
  poster: string;
  tags: string[];
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
  dob: Date;
  bio: string;
  bioLinks: LinkModelType[];
  initialGenres: string[];
  password: string;
  profile: string;
  edited_at: Date | null;
  isActive: boolean;

  session_id: string | null;
  lastLoginAt: Date;
  isBanned: boolean;
  banEndsAt: Date | null;
  followers: number;
  following: number;
  posts: number;
  comments: number;
  public_lists: number;
  total_lists: number;

  favourite_id: Types.ObjectId;
  recommended_id: Types.ObjectId;
  watched_id: Types.ObjectId;
};

export type UserRecommendationModelType = {
  user_id: Types.ObjectId;
  genres: string[];
  favourite: string[];
  recommended: string[];
  watched: string[];
};

export type ThreadModelType = LastUpdateModelType & {
  created_by: Types.ObjectId;
  edit: LastUpdateModelType | null;
  edited_at: Date;
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
  thread_id: Types.ObjectId;
  user_id: Types.ObjectId;
  edited_at: Date;
  reaction_count: number;
  comment_count: number;
  saved_count: number;
  createdAt: Date;
};

export type CommentModelType = {
  content: string;
  replied_to: Types.ObjectId | null;
  post_id: Types.ObjectId;
  user_id: Types.ObjectId;
  upvote_count: number;
  spoiler: boolean;
  nsfw: boolean;
  attachment: string | null;
  edited_at: Date | null;
  saved_count: number;
  createdAt: Date;
};

export type MemberModelType = {
  thread_id: Types.ObjectId;
  user_id: Types.ObjectId;
};

export type ReactionModelType = {
  reaction: string;
  user_id: Types.ObjectId;
  post_id: Types.ObjectId;
};

export type VoteModelType = {
  type: "up" | "down";
  user_id: Types.ObjectId;
  comment_id: Types.ObjectId;
};

export type UserConnectionModelType = {
  follower: Types.ObjectId;
  followee: Types.ObjectId;
  blocked: boolean;
  notification: boolean;
};
