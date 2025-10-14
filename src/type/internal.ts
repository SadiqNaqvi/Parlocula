import { ZodIssue } from "zod";
import { ErrorCodes, ReportReasonType } from "./other";
import { PreDefinedListType } from "./models";

export type GenericDate = Date | number | string;

export type GeneralGetReturn<T = any> =
  | {
    success: true;
    result: T;
    errCode?: undefined;
  }
  | {
    success: false;
    errCode: ErrorCodes;
    result?: undefined;
  };

export type GeneralPostReturn<T = any> =
  | {
    result: T;
    errCode?: undefined;
    formError?: undefined;
    customError?: undefined;
    success: true;
  }
  | {
    success: false;
    errCode: ErrorCodes;
    customError?: string;
    formError?: ZodIssue[];
    result?: undefined;
  };

export type InfiniteQueryResponseDB<T = any> = {
  data: T[];
  total: number;
}

export type GeneralMultipleReturn<T = any> = GeneralGetReturn<InfiniteQueryResponseDB<T>>;

export type Session = {
  user_id: string;
  username: string;
  email: string;
  isBanned: boolean;
  banEndsAt: GenericDate | undefined;
  expireOn: GenericDate;
  profile: string | undefined;
};

export type InfiniteQueryResponse<T = any> = {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
};



export type document = {
  _id: string;
  createdAt: GenericDate;
  updatedAt: GenericDate;
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

export type PredefineListsType = {
  _id: string;
  name: PreDefinedListType;
  poster?: string;
};

export type MereUser = {
  username: string;
  profile?: string;
  _id: string;
};

export type User = {
  _id: string;
  name: string;
  username: string;
  email: string;
  profile: string;
  bio: string;
  dob: GenericDate;
  bioLinks: Link[];
  edited_at: GenericDate | null;

  usernameUpdatedAt?: GenericDate;
  emailUpdatedAt?: GenericDate;

  followers: number;
  following: number;
  posts: number;
  comments: number;
  public_lists: number;
  predefine_lists: PredefineListsType[];
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
  predefine_lists: PredefineListsType[];
};

export type UserConnectionType = {
  follows: boolean;
  followBack: boolean;
  isBlocked: boolean;
  haveBlocked: boolean;
  notification: boolean;
};

export type ThreadConnection = {
  type: "person" | "movie" | "show";
  path: string;
  name: string;
};

export type MereThread = {
  _id: string;
  name: string;
  poster: string;
  member_count: number;
  post_count: number;
};

export type Thread = document & {
  name: string;
  description: string;
  poster: string;
  nsfw: boolean;
  links: Link[];
  connection: ThreadConnection[];
  created_by: string;
  creator: string | null;
  edited_by: string | null;
  member_count: number;
  post_count: number;
  managers: string[];
};

export type ThreadMembership = {
  thread_id: string;
  user_id: string;
  notification: boolean;
  banned: boolean;
  role: "moderator" | "member" | "moderator_invitee";
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
  editedAt: GenericDate | null;
};

export type FullPost = PostBasic & {
  edited_at: GenericDate | null;
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
  edited_at: GenericDate | undefined;
};

export type FullComment = MereComment & {
  post_author: string;
  saved_count: number;
  user_id: string;
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
  list_type: "custom" | "favourite" | "recommended" | "watched";
  item_count: number;
  saved_count: number;
  poster: string;
};

export type FullList = MereList &
  document & {
    user_id: string;
    username: string;
    isPrivate: boolean;
    listKey: string;
    last_added: GenericDate;
    collaborators: string[];
  };

export type ListCollaborators = {
  _id: string;
  user_id: string;
  name: string;
  collaborators: MereUser[];
  invitees: MereUser[];
};

export type ListItemType = {
  _id: string;
  media_id: string;
  list_id: string;
  user_id: string;
  tmdb_id: string;
  year: number;
  createdAt: GenericDate;
  title: string;
  poster?: string;
  media_type: "movie" | "show";
};

export type ThreadModType = MereUser & {
  user_id: string;
  role: "moderator" | "moderator_invitees";
};

export type ReportsType = {
  _id: ReportReasonType,
  count: number,
  content: string[],
};

export type ReportedContent = {
  _id: string,
  reasons: Record<ReportReasonType, number>,
  total: number
} & ({
  content_type: "post",
  content: {
    title: string,
    tag: string,
    nsfw: boolean,
    spoiler: boolean,
    frames: Frame[],
    warnedOn?: GenericDate;
  }
} | {
  content_type: "comment",
  content: {
    content?: string,
    attachment?: string,
    nsfw: boolean,
    spoiler: boolean,
    warnedOn?: GenericDate;
  }
})

export type ParticipantEnumType = "participant" | "invitee" | "creator";
export type RoomEnumType = "private" | "group"

export type ParticipantType = {
  participantType: ParticipantEnumType;
  mute: boolean;
  seenAt: GenericDate;
  hideAt: GenericDate;
};

export type InvitationMessageType = {
  content: string;
  user_id: string;
  username: string;
  createdAt: GenericDate;
};

export type MereRoomType = {
  room_id: string;
  display_name: string;
  poster: string | undefined;
  seenAt: GenericDate;
  mute: boolean;
  type: ParticipantEnumType;
  otherParticipant_id: string | undefined;
  otherParticipant_seenAt: GenericDate | undefined;
  lastMessageBy: string;
  lastMessageAt: GenericDate;
  lastMessage: string;
};

export type RoomListResponse = MereRoomType & {
  room_type: RoomEnumType;
  invitationMessage: InvitationMessageType;
}

export type SearchedRoom = {
  _id: string;
  display_name: string;
  poster?: string;
}

export type FullRoomType = {
  _id: string;
  display_name: string;
  poster?: string;
  type: RoomEnumType;
  seenAt: GenericDate;
  mute: boolean;
  participantType: ParticipantEnumType;
  otherParticipant_id: string | undefined;
  otherParticipant_seenAt: GenericDate | undefined;
  // users: (MereUser & Omit<ParticipantType, "mute" | "hideAt">)[];
  users: string[],
  invitationMessage: InvitationMessageType;
  lastMessage: string;
  lastMessageBy: string;
  lastMessageAt: GenericDate;
};

export type MessageReplyType = {
  replied_to: string,
  replied_content: string
}

export type MereMessage = {
  _id: string;
  content: string;
  createdAt: GenericDate;
  room_id: string;
  user_id: string;
  username: string;
  status?: "sending" | "sent" | "error" | "seen";
} & Partial<MessageReplyType>;

// Cached
export type CachedFullRoomType = {
  type: "private" | "group";
  name: string;
  poster: string | undefined;
  invitationMessage: InvitationMessageType;
  lastMessage: string;
  lastMessageBy: string;
  lastMessageAt: GenericDate;
};

export type CachedParticipantType = ParticipantType & {
  lastSync: GenericDate;
}