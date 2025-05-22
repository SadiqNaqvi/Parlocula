import { ZodIssue } from "zod";

export type GeneralGetReturn<T = any> =
  | {
      success: true;
      result: T;
      errCode?: undefined;
    }
  | {
      success: false;
      errCode: string;
      result?: undefined;
    };

export type GeneralPostReturn<T = any> =
  | {
      result: T;
      errCode?: undefined;
      formError?: undefined;
      success: true;
    }
  | {
      result?: undefined;
      errCode: "pp203";
      formError: ZodIssue[];
      success: false;
    }
  | {
      result?: undefined;
      errCode: string;
      formError?: undefined;
      success: false;
    };

export type GeneralMultipleReturn<T = any> = GeneralGetReturn<{
  data: T[];
  total: number;
}>;

export type Session = {
  user_id: string;
  username: string;
  email: string;
  isBanned: boolean;
  expireOn: Date;
};

export type InfiniteQueryResponse<T = any> = {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
};

export type document = {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Link = {
  path: string;
  label: string;
};

export type Frame = {
  path: string;
  type: "image" | "video";
  isExternal: boolean;
};

export type PredefineListType = {
  _id: string;
  name: "favourite" | "watched" | "recommended";
  poster?: string;
};

export type User = {
  _id: string;
  name: string;
  username: string;
  email: string;
  profile: string;
  bio: string;
  dob: Date;
  bioLinks: Link[];
  edited_at: Date | null;

  followers: number;
  following: number;
  posts: number;
  comments: number;
  public_lists: number;
  predefine_lists: PredefineListType[];
};

export type RequestedUser = {
  _id: string;
  name: string;
  username: string;
  profile: string;
  bio: string;
  bioLinks: Link[];
  followers: number;
  following: number;
  posts: number;
  comments: number;
  public_lists: number;
  predefine_lists: PredefineListType[];
};

export type ThreadConnection = {
  media_type: string;
  id: string;
};

export type MereThread = {
  _id: string;
  name: string;
  poster: string;
};

export type Thread = document & {
  name: string;
  description: string;
  poster: string;
  nsfw: boolean;
  links: Link[];
  connection: ThreadConnection[];
  created_by: string | Partial<User>;
  member_count: number;
  post_count: number;
};

type PostBasic = document & {
  title: string;
  nsfw: boolean;
  spoiler: boolean;
  thread_id: string;
  user_id: string;
  name?: string;
  poster?: string;
  reaction_count: number;
  comment_count: number;
  saved_count: number;
  editedAt: Date | null;
};

export type FullPost = PostBasic & {
  edited_at: Date | null;
  body: string;
  tag: string;
  username?: string;
  frames: Frame[];
  links: Link[];
};

export type MerePost = PostBasic & {
  tag: string;
  frames?: Frame[];
  username?: string;
};

export type MereFrame = PostBasic & {
  frames: Frame[];
};

export type MereLink = PostBasic & {
  links: Link[];
};

export type MereComment = document & {
  _id: string;
  content: string;
  post_id: string;
  upvote_count: number;
  nsfw: boolean;
  spoiler: boolean;
  replied_to?: string;
  username?: string;
  profile?: string;
  parent?: string;
  attachment?: string;
};

export type FullComment = MereComment & {
  edited_at: Date | null;
  post_author: string;
  saved_count: number;
};

export type MediaItemType = {
  title: string;
  poster: string;
  year: number;
  media_type: "movie" | "show";
  tmdb_id: string;
};

export type FullMediaItemType = MediaItemType & {
  _id: string;
  rating: number;
  rating_count: number;
};

export type MereList = {
  _id: string;
  name: string;
  list_type: string;
  item_count: number;
  saved_count: number;
  poster: string;
};

export type FullList = MereList &
  document & {
    user_id: string;
    username: string;
    isPrivate: boolean;
    key: string;
    last_added: Date;
  };

export type ListItemType = {
  _id: string;
  media_id: string;
  list_id: string;
  user_id: string;
  tmdb_id: string;
  year: number;
  createdAt: Date;
  title: string;
  poster?: string;
  media_type: "movie" | "show";
};
