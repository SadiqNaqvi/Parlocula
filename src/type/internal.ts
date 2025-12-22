import { ZodIssue } from "zod";
import { ErrorCodes, ReportReasonType } from "./other";
import { AllShelves, FrameModelType, PredefinedShelves, UserModelType } from "./models";
import { UserMetaData } from "@store/user";

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

export type AggregatedResponse<T = any> = {
  data: T[];
  total: number;
}

export type GeneralMultipleReturn<T = any> = GeneralGetReturn<AggregatedResponse<T>>;

export type TokenPayload = {
  user_id: string;
  username: string;
  profile: FrameModelType | undefined;
  filterContent: boolean;
  isBanned: boolean;
  banEndsAt: GenericDate | undefined;
  dob: GenericDate;
}

export type Session = TokenPayload & {
  email: string;
  expireOn: GenericDate;
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
  hash: string;
  size: number;
};

export type ShelfMetaData = {
  _id: string;
  name: PredefinedShelves;
  poster?: Frame;
};

export type MereUser = {
  username: string;
  profile: Frame | undefined;
  _id: string;
  followers?: number,
  posts?: number
};

export type MereNonCustomShelf = MereShelf & { name: PredefinedShelves }
export type CurrentUser = Omit<
  UserModelType, "passkey" | "session_id" | "isActive" | "lastLoginAt"
> & { predefinedShelves: MereNonCustomShelf[], _id: string }
// {
//   _id: string;
//   name: string;
//   username: string;
//   email: string;
//   profile: string;
//   bio: string;
//   dob: GenericDate;
//   bioLinks: Link[];

//   edited_at: GenericDate | null;
//   usernameUpdatedAt?: GenericDate;
//   emailUpdatedAt?: GenericDate;
//   tempBanned: number;

//   filterContent: boolean;
//   followers: number;
//   following: number;
//   posts: number;
//   comments: number;
//   publicShelves: number;
//   predefinedShelves: ShelfMetaData[];

// };

export type RequestedUser = {
  _id: string;
  name: string;
  username: string;
  profile: Frame;
  bio: string;
  bioLinks: Link[];
  followers: number;
  following: number;
  posts: number;
  comments: number;
  publicShelves: number;
  predefinedShelves: ShelfMetaData[];
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
  poster: Frame;
  member_count?: number;
  post_count?: number;
};

export type Thread = document & {
  name: string;
  description: string;
  poster: Frame;
  nsfw: boolean;
  links: Link[];
  connections: ThreadConnection[];
  created_by: string;
  creator: string | undefined;
  edited_by: string | null;
  member_count: number;
  post_count: number;
  managers: { username: string, _id: string }[];
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
  username: string;
  thread_name: string
  poster: Frame | undefined;
  reaction_count: number;
  comment_count: number;
  saved_count: number;
  editedAt: GenericDate | null;
  category: string;
  quoted_post_id: string | undefined;
  quoted_post_title: string | undefined;
  quoted_post_frames_count: number;
  quoted_post_links_count: number;
  frames_count: number;
  links_count: number;
};

export type FullPost = PostBasic & {
  edited_at: GenericDate | undefined;
  body: string;
  frames: Frame[];
  links: Link[];
};

export type MerePost = PostBasic & {
  frames?: Frame[];
  profile: Frame | undefined;
};

export type MereFrame = PostBasic & {
  frames: Frame[];
  profile: string | undefined;
};

export type MereLink = PostBasic & {
  links: Link[];
  profile: string | undefined;
};

export type CommentReplyType = {
  content: string,
  attachment: string,
}

export type MereComment = document & {
  _id: string;
  content: string;
  post_id: string;
  likes_count: number;
  saved_count: number;
  user_id: string;
  nsfw: boolean;
  spoiler: boolean;
  replied_to: string | undefined;
  parentComment: CommentReplyType | undefined;
  username?: string;
  profile?: Frame;
  attachment: string;
  edited_at: GenericDate | undefined;
  status?: "sending" | "sent";
};

export type FullComment = MereComment & {
  post_author: string;
  thread_id: string;
};

export type CinementType = {
  title: string;
  poster: Frame;
  year: number;
  cinement_type: "movie" | "show";
  ext_id: string;
};

export type FullCinementType = CinementType & {
  _id: string;
} & Record<PredefinedShelves, number>;

export type MereShelf = {
  _id: string;
  name: string;
  shelf_type: AllShelves;
  item_count?: number;
  saved_count?: number;
  poster: string | undefined;
  isPrivate: boolean;
  shelfKey: string | undefined;
  last_added: GenericDate | undefined;
};

export type FullShelf = MereShelf &
  document & {
    user_id: string;
    username: string;
    collaborators: string[];
    save_count: number,
    createdAt: GenericDate,
  };

export type ShelvesForCinement = {
  shelves: string[]
}

export type ShelfCollaborator = UserMetaData & { type: "invitee" | "collaborator" }
export type ShelfCollaborators = {
  creator: string;
  collaborators: ShelfCollaborator[];
};

export type ShelfItemType = {
  _id: string;
  cinement_id: string;
  shelf_id: string;
  user_id: string;
  ext_id: string;
  year: number;
  createdAt: GenericDate;
  title: string;
  poster: string | undefined;
  cinement_type: "movie" | "show";
  added_by: string | undefined;
};

export type ModeratorType = UserMetaData & { role: "moderator" | "moderator_invitees" };

export type ThreadModType = {
  creator: UserMetaData,
  managers: ModeratorType[],
}
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
  poster: Frame | undefined;
  seenAt: GenericDate;
  mute: boolean;
  type: ParticipantEnumType;
  otherParticipant_id: string | undefined;
  otherParticipant_seenAt: GenericDate | undefined;
  lastMessageBy: string;
  lastMessageAt: GenericDate;
  lastMessage: string;
  createdAt?: GenericDate;
};

export type RoomListResponse = MereRoomType & {
  room_type: RoomEnumType;
  invitationMessage: InvitationMessageType;
}

export type SearchedRoom = {
  _id: string;
  display_name: string;
  poster?: Frame;
}

export type FullRoomType = {
  _id: string;
  display_name: string;
  poster: Frame | undefined;
  participant_count: number;
  type: RoomEnumType;
  seenAt: GenericDate;
  mute: boolean;
  participantType: ParticipantEnumType;
  otherParticipant_id: string | undefined;
  otherParticipant_seenAt: GenericDate | undefined;
  invitationMessage: InvitationMessageType;
  lastMessage: string;
  lastMessageBy: string;
  lastMessageAt: GenericDate;
  createdAt: GenericDate;

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
  poster: Frame | undefined;
  invitationMessage: InvitationMessageType;
  lastMessage: string;
  lastMessageBy: string;
  lastMessageAt: GenericDate;
  createdAt: GenericDate;
};

export type CachedParticipantType = ParticipantType & {
  lastSync: GenericDate;
}