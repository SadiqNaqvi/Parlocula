import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { Frame, GenericDate, InfiniteQueryResponse, MereMessage } from "./internal";
import { ExtMediaSource } from "./schemas";

export type ParloPageProps<
  P = { id: string, username: string, [key: string]: string },
  S = { p: string, f: string, t: string, k: string, [key: string]: string }
> = {
  params: Promise<P>,
  searchParams: Promise<Partial<S>>,
}

type Arguments<A> =
  A extends undefined ? [] :
  A extends any[] ? A : [A];
export type TypedFunction<A = undefined, R = void> = (...args: Arguments<A>) => R

export type ArrayForArrayResponse<T, R> = T extends any[] ? R[] : R;

export type UsersShelfType =
  | "favourite"
  | "recommended"
  | "watched"
  | "saved"
  | "private";

export type ErrorCodes =
  | "unknown_error"
  | "database_connection_fail"
  | "media_upload_fail"
  | "resource_not_found"
  | "data_storing_fail"
  | "session_store_fail"
  | "unstable_internet"
  | "unauthorized_access"
  | "unauthenticated_access"
  | "form_error"
  | "invalid_object_id"
  | "invalid_input"
  | "temporary_banned"
  | "rate_limit_exceed"
  | "blocked_by_author"
  | "not_a_member"
  | "email_verification_limit_exceed"
  | "wrong_passkey"
  | "early_identification_update"
  | "invalid_verification_code"
  | "verification_code_expired"
  | "uncaught_error"
  | "missing_device_fingerprint"
  | "unregistered_user"
  | "custom_error"

export type AvailableCacheTags =
  | "user_username"
  | "currentUser_uid"
  | "connection_rid_uid"
  | "usernameAvailability_username"
  | "userExistence_email"
  | "joinedThreadsOfUser_uid"
  | "createdThreadsOfUser_uid"
  | "threadsManageByUser_uid"
  | "postsOfUser_uid"
  | "commentsOfUser_uid"
  | "thread_tid"
  | "membersOfThread_tid"
  | "threadList_filter"
  | "postsOfThread_tid"
  | "member_tid_uid"
  | "post_pid"
  | "reaction_pid_uid"
  | "commentsOfPost_pid"
  | "quotedPosts_pid"
  | "comment_cid"
  | "replies_cid"
  | "like_cid_uid"
  | "taleon_extid"
  | "shelf_sid"
  | "shelvesOfUser_uid"
  | "privateShelvesOfUser_uid"
  | "allShelvesOfUser_uid"
  | "collaborativeShelvesOfUser_uid"
  | "invitedShelvesOfUser_uid"
  | "itemsOfShelf_sid"
  | "saved-posts_uid"
  | "saved-comments_uid"
  | "saved-shelfs_uid"
  | "isSaved_uid_id"
  | "shelvesForTaleon_tid_uid"
  | "threadManagers_tid"
  | "shelfCollaborators_sid"
  | "isShelfCollaborator_uid_sid"
  | "notifications_uid"
  | "followersOfUser_uid"
  | "followingOfUser_uid"
  | "blockedByUser_uid"
  | "roomInvitations_uid"
  | "room_rmid_uid"
  | "reports_cnid"
  | "reportExists_cnid_uid";

export type AvailableRevalidateTags =
  | "registration_email_username"
  | "loginLogout_uid"
  | "userMutation_uid_username"
  | "userUsernameMutation_uid_oldUsername_newUsername"
  | "userEmailMutation_uid_oldEmail_newEmail"
  | "threadMutation_tid_uid"
  | "threadMembershipMutation_tid_uid"
  | "threadManagersMutation_tid_uid"
  | "postMutation_pid_tid_uid"
  | "postUpdation_pid"
  | "reactionMutation_pid_uid"
  | "commentMutation_cid_uid_pid"
  | "commentUpdation_cid"
  | "likesMutation_cid_uid_author"
  | "taleon_extid"
  | "shelfMutation_sid_uid"
  | "shelfUpdation_sid"
  | "shelfCollaboratorMutation_uid_sid"
  | "addItemsInShelf_sid"
  | "savedPosts_uid"
  | "savedComments_uid"
  | "savedShelves_uid"
  | "isSaved_uid_id"
  | "followUnfollow_rid_uid"
  | "blockUnblock_rid_uid"
  | "notifications_uid"
  | "roomInvitations_uid"

export type AvailableQueryKeys =
  | "user_username"
  | "connection_ruid"
  | "postsOfUser_uid_filter"
  | "joinedThreadsOfUser_uid"
  | "createdThreadsOfUser_uid"
  | "threadsManageByUser_uid"
  | "threads_filter"
  | "thread_id"
  | "members_tid"
  | "membership_tid"
  | "postsOfThread_tid_filter_category"
  | "post_id"
  | "reaction_pid"
  | "commentsOfPost_pid_filter"
  | "quotes_pid"
  | "commentsOfUser_uid_filter"
  | "comment_cid"
  | "like_cid"
  | "replies_cid_filter"
  | "threadsOnTaleonOrArtist_id"
  | "shelf_sid"
  | "shelvesOfUser_uid_filter"
  | "privateShelvesOfUser_uid"
  | "allShelvesOfUser_uid"
  | "collaboratedShelvesOfUser_uid"
  | "invitedShelvesOfUser_uid"
  | "itemsOfShelf_sid_filter"
  | "privateShelf_sid_key"
  | "itemsOfPrivateShelf_sid_key_filter"
  | "shelfsForTaleon_cnid"
  | "isContentSaved_type_id"
  | "saved-posts_uid"
  | "saved-comments_uid"
  | "saved-shelfs_uid"
  | "notifications_uid"
  | "shelfCollaborators_sid"
  | "followersOfCurrentUser_uid"
  | "followingOfCurrentUser_uid"
  | "blockedByCurrentUser_uid"
  | "shelfConnection_sid"
  | "bannedMembers_tid"
  | "threadManagers_tid"
  | "search-followers_uid_query"
  | "search-following_uid_query"
  | "searchMembers_tid_query"
  | "searchBannedMembers_tid_query"
  | "searchNonBlockedUser_query_uid"
  | "rooms_uid"
  | "messages_rmid"
  | "room_rmid_uid"
  | "participantsOfRoom_rmid_uid"
  | "roomInvitations_uid"
  | "roomInvitationsCount_uid"
  | "roomExists_ruid_uid"
  | "reports_cnid"
  | "ifReportExists_cnid_type"
  | "reportedContents_type_tid"
  | "trendingPosts"
  | "curatedPost_uid"
  ;

export type AblyEventType =
  | "entered_chat"
  | "notification"
  | "message"
  | "message_unsend"
  | "typing"
  | "typing_stop"

export type AblyEventParams = {
  "entered_chat": { user_id: string, room_id: string, time: GenericDate }
  "notification": { title: string },
  "message": MereMessage & { room?: { display_name: string, mute: boolean, poster?: Frame } },
  "message_unsend": { room_id: string, message_id: string }
  "typing": { room_id: string, sender: string }
  "typing_stop": { room_id: string, sender: string }
}

export type ReportReasonType =
  | "Spam or Promoting Spam"
  | "Harassment/Threatening"
  | "Hate/Abuse"
  | "Promoting or Mentioning illegal activities"
  | "Promoting/Selling Items"
  | "Attached Malicious/Harmful Links"
  | "Promoting/Performing Self harm or Suicide"
  | "Spreading False Information"
  | "Minor Abuse or Sexualization"
  | "Flag as NSFW"
  | "Flag as Spoiler"
  | "Inappropriate Content"
  | "Duplicate Thread"
  | "Under-age User"
  | "Impersonation/Pretending to be someone else"
  | "Scam or Fraud"
  | "No Longer Active";

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
  | "shelves"
  | "items";

export type MutationFnProps<T = any> = {
  newState: T;
  action: string;
  user_id: string;
};

export type MereContent = {
  _id: string;
  name: string;
  poster: string;
};

export type ContentMutationProps =
  | {
    data: MereContent;
    action: "add";
  }
  | {
    data: { id: string };
    action: "remove";
  };

export type DeviceLimitation = {
  overall: number;
  email: number;
  expireAt: number;
};

export type InputManagerType<T = any> = {
  getData: () => T;
  length: number;
};

export type backdrop_sizes = "w300" | "w780" | "w1280" | "original";
export type logo_sizes =
  | "w45"
  | "w92"
  | "w154"
  | "w185"
  | "w300"
  | "w500"
  | "original";
export type poster_sizes =
  | "w92"
  | "w154"
  | "w185"
  | "w342"
  | "w500"
  | "w780"
  | "original";
export type profile_sizes = "w45" | "w185" | "h632" | "original";
export type still_sizes = "w92" | "w185" | "w300" | "original";

export type ExternalImageTypeToSizeMap = {
  "poster": poster_sizes,
  "backdrop": backdrop_sizes,
  logo: logo_sizes,
  still: still_sizes,
  profile: profile_sizes;
}

export type ExternalImageType = keyof ExternalImageTypeToSizeMap;
export type ExternalImageSize<T extends ExternalImageType> = ExternalImageTypeToSizeMap[T];

export type GetPosterFunctionProps<T extends ExternalImageType> = {
  path: string | null;
  external?: boolean;
  type?: ExternalImageType | "shelfPoster";
  size?: ExternalImageSize<T>;
  extSource?: ExtMediaSource;
}

export type PushNotificationType = {
  title: string,
  body?: string,
  icon?: string,
  path?: string,
  tag?: string,
  image?: string,
  actions?: { "action": string, title: string }[],
  "requireInteraction"?: boolean,
  "silent"?: false,
};

export type InfiniteScrollerDataType<T = any> = {
  pages: InfiniteQueryResponse<T>[];
  pageParams: number[];
};

export type ExtractPlaceholders<S extends string> =
  S extends `${string}_${infer Param}_${infer Rest}`
  ? Param | ExtractPlaceholders<`${Param}_${Rest}`>
  : S extends `${string}_${infer Param}`
  ? Param
  : never;

export type QueryKeyArgs<K extends AvailableQueryKeys> = Record<
  ExtractPlaceholders<K>,
  string
>;

export type CacheTagsArgs<K extends AvailableCacheTags> = Record<
  ExtractPlaceholders<K>,
  string | number | boolean
>;

export type RevalidateTagsArgs<K extends AvailableRevalidateTags> = Record<
  ExtractPlaceholders<K>,
  string
>;

export type CookiesType = ReadonlyRequestCookies | RequestCookies;

export type PPGetDataProps<K extends AvailableCacheTags> = {
  url: string;
  cookies?: CookiesType;
  revalidate?: number;
  searchParams?: Record<string, string | number | boolean>;
} & (
    | {
      tag?: undefined;
      options?: undefined;
    }
    | {
      tag: K;
      options: CacheTagsArgs<K>;
    }
  );

export type FormidableFile = {
  size: number;
  filepath: string;
  originalFilename: string | null;
  newFilename: string;
  mimetype: string | null;
}

export type HistoryStackType = {
  title?: string;
  poster?: Frame | string;
  image?: Frame | string;
  path: string;
}