import { PipelineStage } from "mongoose";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { Frame, GenericDate, InfiniteQueryResponse, MereMessage } from "./internal";
import { NotificationModelType } from "./models";

export type ParloPageProps<
  P = { id: string, username: string },
  S = { p?: string, f?: string, t?: string, k?: string }
> = {
  params: Promise<P>,
  searchParams: Promise<S>,
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
  | "joinedThreadsOfUser_uid_page"
  | "postsOfUser_uid_filter_page_nsfw"
  | "commentsOfUser_uid_filter_page_nsfw"
  | "thread_tid"
  | "membersOfThread_tid_page"
  | "threads_filter_page_nsfw"
  | "postsOfThread_filter_tid_page_category_nsfw"
  | "member_tid_uid"
  | "post_pid"
  | "reaction_pid_uid"
  | "commentsOfPost_pid_filter_page_nsfw"
  | "quotedPosts_pid_page_nsfw"
  | "comment_cid"
  | "replies_cid_filter_page_nsfw"
  | "like_cid_uid"
  | "cinement_extid"
  | "shelf_sid_key"
  | "shelvesOfUser_uid_filter_page"
  | "privateShelvesOfUser_uid_page"
  | "allShelvesOfUser_uid_page"
  | "collaborativeShelvesOfUser_uid_page"
  | "invitedShelvesOfUser_uid_page"
  | "items_sid_filter_page_key"
  | "saved-posts_uid_page"
  | "saved-comments_uid_page"
  | "saved-shelfs_uid_page"
  | "isSaved_uid_id"
  | "shelvesForCinement_cid_uid"
  | "threadManagers_tid"
  | "shelfCollaborators_sid"
  | "isShelfCollaborator_uid_sid"
  | "notifications_uid_page"
  | "followersOfUser_uid_page"
  | "followingOfUser_uid_page"
  | "blockedByUser_uid_page"
  | "roomInvitations_uid"
  | "room_rmid_ruid_uid"
  | "reports_cnid"
  | "reportExists_cnid_uid";

export type AvailableRevalidateTags =
  | "registration_email_username"
  | "loginLogout_uid"
  | "userMutation_uid_username"
  | "userUsernameMutation_uid_oldUsername_newUsername"
  | "userEmailMutation_uid_oldEmail_newEmail"
  | "threadMutation_tid"
  | "threadMembershipMutation_tid_uid"
  | "threadManagersMutation_tid_uid"
  | "postMutation_pid_tid_uid_category"
  | "postUpdation_pid"
  | "reactionMutation_pid_uid"
  | "commentMutation_cid_uid_pid"
  | "commentUpdation_cid"
  | "likesMutation_cid_uid_author"
  | "cinement_extid"
  | "shelfMutation_sid_uid_key"
  | "shelfUpdation_sid_key"
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
  | "threadsOnCinementOrArtist_id"
  | "shelf_sid"
  | "shelvesOfUser_uid_filter"
  | "privateShelvesOfUser_uid"
  | "allShelvesOfUser_uid"
  | "collaboratedShelvesOfUser_uid"
  | "invitedShelvesOfUser_uid"
  | "itemsOfShelf_sid_filter"
  | "privateShelf_sid_key"
  | "itemsOfPrivateShelf_sid_key_filter"
  | "shelfsForCinement_cnid"
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
  | "roomExists_ruid_uid"
  | "reports_cnid"
  | "ifReportExists_cnid_type"
  | "reportedContents_type_tid";

export type AblyEventType =
  | "entered_chat"
  | "notification"
  | "message"
  | "message_unsend"
  | "typing"
  | "typing_stop"

export type AblyEventParams = {
  "entered_chat": { user_id: string, room_id: string, time: GenericDate }
  "notification": NotificationModelType
  "message": MereMessage & {
    room: {
      display_name: string,
      poster?: Frame,
      mute: boolean,
    }
  },
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

export type PipelineFunc<T = { [key: string]: any }> = (
  __0: {
    filters: PipelineStage[];
    page: number;
    sort?: any;
    localFieldForLookup?: string,
    replaceRoot?: string,
    limit?: number;
  } & T
) => PipelineStage[];

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

type InternalPosterProps = {
  external?: false | undefined;
  type?: "image" | "video";
  size?: undefined;
};

type ExternalPosterProps =
  | {
    external: true;
    type: "backdrop";
    size: backdrop_sizes;
  }
  | {
    external: true;
    type: "logo";
    size: logo_sizes;
  }
  | {
    external: true;
    type: "poster";
    size: poster_sizes;
  }
  | {
    external: true;
    type: "profile";
    size: profile_sizes;
  }
  | {
    external: true;
    type: "still";
    size: still_sizes;
  };

export type getPosterFunctionProps = {
  path?: string | null;
} & (InternalPosterProps | ExternalPosterProps);

export type PushNotificationType = {
  title: string;
  body?: string;
  data?: { path: string };
  tag?: string;
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