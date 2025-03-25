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
  size: number;
};

export type UserModelType = {
  name: string;
  username: string;
  email: string;
  dob: Date;
  bio: string;
  bioLinks: LinkModelType[];
  genres: string[];
  password: string;
  profile: string;
  edited_at: Date | null;
  session_id: string | null;
  lastLoginAt: Date;
  follower_count: number;
  following_count: number;
  post_count: number;
  isBanned: boolean;
};

export type UserDataModelType = {
  user_id: Types.ObjectId;
  email: string;
  username: string;
  genres: string[];
  celebs: string[];
  watch: string[];
  reports: ReportModelType[];
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
