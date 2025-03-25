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

export type GeneralMultipleReturn<T = any> =
  | {
      result: { data: T[]; total: number };
      errCode: undefined;
      success: true;
    }
  | {
      result: undefined;
      errCode: string;
      success: false;
    };

export type AvailableCacheTags =
  | "user_username"
  | "currentUser_uid"
  | "connection_rid_uid"
  | "usernameAvailability_username"
  | "userExistence_email"
  | "threadsByUser_username"
  | "filteredPostsOfUser_username_filter_page"
  | "thread_tid"
  | "filteredThreads_filter_page"
  | "filteredPostsOfThread_filter_tid_page"
  | "filteredFramesOfThread_filter_tid_page"
  | "filteredLinksOfThread_filter_tid_page"
  | "member_tid_uid"
  | "post_pid"
  | "reaction_pid_uid"
  | "filteredComments_pid_filter_page"
  | "comment_cid"
  | "replies_cid"
  | "vote_cid_uid"
  | "media_tmdbid"
  | "list_lid"
  | "items_lid_filter_page";

export type AvailableRevalidateTags =
  | "registration_email_username"
  | "login_uid"
  | "logout_uid"
  | "connection_rid_uid"
  | "threadCreation_tid_username"
  | "joiningThread_tid_username_uid"
  | "leavingThread_uid_username_tid"
  | "postCreation_pid_tid_username"
  | "postUpdation_pid"
  | "postDeletion_pid_tid_username"
  | "reactionCreation_pid_uid"
  | "reactionDeletion_pid_uid"
  | "commentCreation_cid_username_pid"
  | "commentDeletion_cid_username_pid"
  | "voteCreation_cid_uid"
  | "voteDeletion_cid_uid"
  | "media_tmdbid"
  | "listCreation_lid"
  | "addItemsInList_lid";

export type PostResponseWithCacheOptions =
  | {
      result: any;
      success: true;
      errCode?: null;
      options: any;
      available: AvailableRevalidateTags;
    }
  | {
      result?: null;
      success: false;
      errCode: string;
      options?: any;
      available?: AvailableRevalidateTags;
    };

export type DeleteResponseWithCacheOptions =
  | {
      success: true;
      errCode?: null;
      files: any[];
      options: any;
      available: AvailableRevalidateTags;
    }
  | {
      success: false;
      files: undefined;
      errCode: string;
      options?: any;
      available?: AvailableRevalidateTags;
    };

export type CloudinaryMediaOptions =
  | "aspect_ratio"
  | "crop"
  | "width"
  | "height"
  | "quality"
  | "filter"
  | "round";

export type CloudinaryMediaObject = Partial<
  Record<CloudinaryMediaOptions, string>
>;

export type QueryFilterType =
  | "threads"
  | "posts"
  | "comments"
  | "userPosts"
  | "lists"
  | "items";

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

export type MutationFnProps<T = any> = {
  state: T;
  user: User;
  setUser: (data: User) => void;
  updateUser: (data: Partial<User>) => void;
  setUserHash: (data: User) => void;
  clearUser: () => void;
};

export type User = {
  _id: string;
  dob: Date;
  name: string;
  bio: string;
  username: string;
  email: string;
  lastUpdatedAt: Date;
  genres: string[];
  celebs: string[];
  watch: string[];
  profile: string;
  followers: number;
  following: number;
  post_count: number;
  comments_count: number;
  collection_count: number;
  public_collection_count: number;
  recommend_items_count: number;
  favourites_count: number;
  recently_joined: {
    _id: string;
    name: string;
    poster: string;
  }[];
};

export type Links = {
  label: string;
  url: string;
};

export type ThreadConnection = {
  media_type: string;
  id: string;
};

export type MereThread = {
  _id: string;
  name: string;
  description: string;
  poster: string;
};

export type Thread = timestamp & {
  _id: string;
  name: string;
  description: string;
  poster: string;
  nsfw: boolean;
  links: Links[];
  connection: ThreadConnection[];
  created_by: string | Partial<User>;
  member_count: number;
  post_count: number;
};

export type timestamp = {
  createdAt: Date;
  updatedAt: Date;
};

export type Link = {
  path: string;
  label: string;
};

export type FullPost = timestamp & {
  _id: string;
  title: string;
  body: string;
  tag: string;
  nsfw: boolean;
  spoiler: boolean;
  thread_id: string;
  user_id: string;
  username?: string;
  poster?: string;
  frames: Frame[];
  links: Link[];
  reaction_count: number;
  comment_count: number;
};

export type MerePost = timestamp & {
  _id: string;
  title: string;
  tag: string;
  nsfw: boolean;
  frame?: Frame;
  spoiler: boolean;
  thread_id: string;
  name?: string;
  poster: string;
  reaction_count: number;
  comment_count: number;
};

export type Frame = {
  path: string;
  type: "image" | "video";
};

export type MereFrame = {
  _id: string;
  title: string;
  thread_id: {
    _id: string;
    name: string;
  };
  user_id: {
    _id: string;
    profile: string | null;
  };
  frames: {
    url: string;
    type: "image" | "video";
  }[];
  nsfw: boolean;
  spoiler: boolean;
  likes: number;
  comments: number;
  createdAt: Date;
};

export type MereLink = {
  _id: string;
  createdAt: Date;
  title: string;
  thread_id: {
    _id: string;
    name: string;
  };
  user_id: {
    _id: string;
    profile: string | null;
  };
  links: Links[];
  nsfw: boolean;
  spoiler: boolean;
  likes: number;
  comments: number;
};

export type MereComment = timestamp & {
  _id: string;
  content: string;
  post_id: string;
  upvote_count: number;
  nsfw: boolean;
  spoiler: boolean;
  post_author: string;
  replied_to?: string;
  username?: string;
  profile?: string;
  parent?: string;
  attachment?: string;
};

type CommanInputFrame = { url: string; type: "image" | "video"; size: number };

export type InputFrame = CommanInputFrame &
  ({ blob: null; isExternal: true } | { blob: Blob; isExternal: false });

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
  item_count: number;
  poster: string;
};

export type FullList = MereList &
  timestamp & {
    description: string;
    username: string;
    isPrivate: boolean;
    key: string;
    last_added: Date;
    save_count: number;
  };
