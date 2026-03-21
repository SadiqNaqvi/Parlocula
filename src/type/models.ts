import { Frame, GenericDate } from "./internal";

type Nanoid = string;

type DocumentExpiration = {
  expiresAt?: Date;
}

export type ReportModelType = {
  _id?: Nanoid;
  user_id: Nanoid;
  ext_id?: Nanoid;
  reason: string;
  details?: string;
  content_id: Nanoid;
  content_type: string;
};

export type LinkModelType = {
  _id?: Nanoid;
  label: string;
  path: string;
};

export type BasedOnModelType = {
  _id?: Nanoid;
  type: string;
  extid: string;
  name: string;
};

export type FrameModelType = Frame & {
  _id?: Nanoid;
};

export type UserModelType = {
  _id?: Nanoid;
  name?: string;
  username: string;
  email: string;
  dob: GenericDate;
  bio: string;
  bioLinks: LinkModelType[];
  profile: Frame | undefined;
  passkey: string;

  session_id: string;
  edited_at?: GenericDate | undefined;
  isActive?: boolean;
  usernameUpdatedAt?: GenericDate | undefined;
  emailUpdatedAt?: GenericDate | undefined;
  lastPostedAt?: GenericDate | undefined;
  lastShelfCreatedAt?: GenericDate | undefined;
  lastCommentedAt?: GenericDate | undefined;
  lastLoginAt?: GenericDate;

  push_endpoint?: string;
  push_p256dh?: string
  push_auth?: string;

  filterContent?: boolean;
  isBanned?: boolean;
  banEndsAt?: GenericDate | undefined;
  deletionId?: string;
  tempBanned?: number;

  followers?: number;
  following?: number;
  posts?: number;
  comments?: number;
  publicShelves?: number;
  joinedThreads?: number;
  createdThreads?: number;
  reactions?: number;
  likes?: number;
  savedContents?: number;
  rooms?: number;
};

export type ThreadModelType = {
  _id?: Nanoid;
  description: string;
  links: LinkModelType[];
  name: string;
  nsfw: boolean;
  poster: FrameModelType;
  created_by: Nanoid;
  connections: BasedOnModelType[];
  edited_at?: GenericDate | undefined;
  edited_by?: Nanoid | undefined;
  lastPostedAt?: GenericDate | undefined;
  lastCommentedAt?: GenericDate | undefined;
  post_count?: number;
  comment_count?: number;
  member_count?: number;
};

export type PostModelType = {
  _id?: Nanoid;
  title: string;
  body: string;
  category: string;
  links: LinkModelType[];
  links_count: number;
  frames: FrameModelType[];
  frames_count: number;
  nsfw: boolean;
  spoiler: boolean;
  thread_id: Nanoid;
  user_id: Nanoid;
  quoted_post_id: Nanoid | undefined;
  edited_at?: GenericDate;
  reaction_count?: number;
  comment_count?: number;
  saved_count?: number;
  quoted_count?: number;
};

export type CommentModelType = {
  _id?: Nanoid;
  content: string;
  attachment: string;
  replied_to?: Nanoid | undefined;
  post_id: Nanoid;
  user_id: Nanoid;
  spoiler: boolean;
  nsfw: boolean;
  likes_count?: number;
  replies_count?: number;
  edited_at?: GenericDate | undefined;
  saved_count?: number;
};

export type MembershipModelType = {
  _id?: Nanoid;
  thread_id: Nanoid;
  user_id: Nanoid;
  role: "creator" | "moderator" | "member" | "moderator_invitee";
  actionsTaken?: number,
  notification?: boolean;
  banned?: boolean;
};

export type ReactionModelType = {
  _id?: Nanoid;
  reaction: string;
  user_id: Nanoid;
  post_id: Nanoid;
};

export type LikesModelType = {
  _id?: Nanoid;
  user_id: Nanoid;
  comment_id: Nanoid;
};

export type ConnectionModelType = {
  _id?: Nanoid;
  follower: Nanoid;
  followee: Nanoid;
  blocked: boolean;
  notification: boolean;
};

export type TaleonModelType = {
  _id?: Nanoid;
  title: string;
  poster: string;
  year: number;
  taleon_type: "movie" | "show";
  ext_id: string;
  favourite?: number;
  watched?: number;
  recommended?: number;
  editedAt: GenericDate;
};

export type PredefinedShelves = "favourite" | "recommended" | "watched";
export type AllShelves = PredefinedShelves | "custom";

export type ShelfModelType = {
  _id?: Nanoid;
  name: string;
  poster?: string;
  user_id: Nanoid;
  isPrivate: boolean;
  shelfKey: string | undefined;
  last_added?: GenericDate;
  item_count?: number;
  shelf_type: AllShelves;
  saved_count?: number;
};

export type ShelfItemModelType = {
  _id?: Nanoid;
  taleon_id: Nanoid;
  shelf_id: Nanoid;
  user_id: Nanoid;
  ext_id: string;
  year: number;
  createdAt?: GenericDate;
};

export type CollaboratorModelType = {
  _id?: Nanoid;
  user_id: Nanoid,
  shelf_id: Nanoid,
  type: "invitee" | "collaborator"
} & DocumentExpiration;

export type BookmarkModelType = {
  _id?: Nanoid;
  user_id: Nanoid;
  content_id: Nanoid;
  content_type: "Post" | "Comment" | "Shelf";
  createdAt: GenericDate;
};

export type NotificationModelType = {
  _id?: Nanoid;
  title: string;
  message: (
    | { type: "text"; text: string }
    | { type: "link"; label: string; path: string }
  )[];
  poster: string | undefined;
  path?: string;
  user_id: Nanoid;
  metadata?: Record<string, any>;
  content_id?: string;
  type?: "request" | "informative";
  status?: "pending" | "accepted" | "denied";
  request_type?: "manager_invitation" | "collaborator_invitation";
  createdAt?: GenericDate;
};

export type SanctionModelType = {
  _id: Nanoid,
  userId: Nanoid,
  type: "warning" | "temp_ban" | "perm_ban",
  reason: string,
  createdAt: GenericDate,
  metadata: Record<string, any>, // evidence or links
  active: boolean,
} & DocumentExpiration

export type RoomModelType = {
  _id?: Nanoid;
  participants: Nanoid[]; // Only filled if room type is private
  participant_count?: number;
  type: "private" | "group";
  name: string | undefined;
  poster: Frame | undefined;
  lastMessage: string;
  lastMessageAt: GenericDate;
  lastMessageBy: Nanoid;
  invitationMessage: {
    content: string;
    user_id: Nanoid;
    username: string;
    createdAt: GenericDate;
  };
  createdAt?: GenericDate;
} & DocumentExpiration;

export type ParticipantModelType = {
  _id?: Nanoid;
  user_id: Nanoid;
  room_id: Nanoid;
  seenAt?: GenericDate | undefined;
  hideAt?: GenericDate | undefined;
  mute?: boolean;
  type: "participant" | "invitee" | "creator";
} & DocumentExpiration;

export type MessageModelType = {
  _id?: Nanoid;
  username: string;
  user_id: Nanoid;
  room_id: Nanoid;
  content: string;
  createdAt: GenericDate;
  replied_to?: string;
  replied_content?: string;
};