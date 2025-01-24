export type User = {
  _id: string;
  dob: Date;
  name: string;
  bio: string;
  username: string;
  email: string;
  lastUpdatedAt: Date;
  genres: [string];
  celebs: [string];
  watch: [string];
  profile: string;
  followers: number;
  following: number;
  post_count: number;
  comments_count: number;
  collection_count: number;
  public_collection_count: number;
  recommendations_count: number;
  favourites_count: number;
  recently_joined: [string];
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
  _id:string,
  title: string;
  description: string;
  poster: string;
};

export type Thread = {
  _id: string;
  title: string;
  description: string;
  poster: string;
  nsfw: boolean;
  links: Links[];
  connection: ThreadConnection[];
  created_by: string | Partial<User>;
  members_count: number;
  posts_count: number;
};

export type GeneralSingleReturn<T = any> =
  | {
      result: T;
      error: null;
      success: true;
    }
  | {
      result: null;
      error: string;
      success: false;
    };

export type GeneralMultipleReturn<T = any> =
  | {
      result: { data: T[]; total: number };
      error: null;
      success: true;
    }
  | {
      result: null;
      error: string;
      success: false;
    };

export type InfiniteQueryResponse<T = any> = {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
};

export type MerePost = {
  _id: string;
  title: string;
  body: string;
  tag: string;
  nsfw: boolean;
  spoiler: boolean;
  thread_id: {
    _id: string;
    name: string;
  };
  user_id: {
    _id: string;
    profile: string | null;
  };
  likes: number;
  comments: number;
  createdAt: Date;
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
    uri: string;
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
