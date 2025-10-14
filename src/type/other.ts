import { ClientSession, PipelineStage } from "mongoose";
import { Frame, GeneralGetReturn, GenericDate, InfiniteQueryResponse, MereMessage } from "./internal";
import { NextRequest } from "next/server";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { MessageModelType, NotificationModelType } from "./models";

export type UserBasedButtonProps<T = any> = {
  state: T | null;
  isPending: boolean;
  onClick: (newState: T, action: any) => void;
};

export type UsersListType =
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
  | "threadsByUser_uid_page"
  | "postsOfUser_username_filter_page"
  | "commentsOfUser_username_filter_page"
  | "thread_tid"
  | "membersOfThread_tid_page"
  | "filteredThreads_filter_page"
  | "postsOfThread_filter_tid_page_tag"
  | "member_tid_uid"
  | "post_pid"
  | "reaction_pid_uid"
  | "filteredComments_pid_filter_page"
  | "reposts_pid_page"
  | "comment_cid"
  | "replies_cid_filter_page"
  | "vote_cid_uid"
  | "media_tmdbid"
  | "list_lid_key"
  | "listsOfUser_filter_username_page"
  | "privateListsOfUser_filter_uid_page"
  | "items_lid_filter_page_key"
  | "saved-posts_uid_page"
  | "saved-comments_uid_page"
  | "saved-lists_uid_page"
  | "isSaved_uid_id"
  | "listsForMedia_mid_uid"
  | "threadManagers_tid"
  | "listCollaborators_lid"
  | "notifications_uid_page"
  | "followersOfUser_uid_page"
  | "followingOfUser_uid_page"
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
  | "threadManagersMutation_tid"
  | "threadInviteesMutation_tid"
  | "postMutation_pid_tid_username_tag"
  | "postUpdation_pid"
  | "reactionMutation_pid_uid"
  | "commentMutation_cid_username_pid"
  | "commentUpdation_cid"
  | "voteMutation_cid_uid_author"
  | "media_tmdbid"
  | "listMutation_lid_username"
  | "listCollaboratorsMutation_lid"
  | "listUpdation_lid"
  | "addItemsInList_lid"
  | "savedPosts_uid"
  | "savedComments_uid"
  | "savedLists_uid"
  | "isSaved_uid_id"
  | "followUnfollow_rid_uid"
  | "blockUnblock_rid_uid"
  | "notifications_uid"
  | "roomInvitations_uid";

export type AvailableQueryKeys =
  | "user_username"
  | "connection_ruid"
  | "postsOfUser_username_filter"
  | "threadOfUser_uid"
  | "threads_filter"
  | "thread_id"
  | "members_tid"
  | "membership_tid"
  | "postsOfThread_tid_filter_tag"
  | "post_id"
  | "reaction_pid"
  | "commentsOfPost_pid_filter"
  | "reposts_pid"
  | "commentsOfUser_username_filter"
  | "comment_cid"
  | "vote_cid"
  | "replies_cid_filter"
  | "list_lid"
  | "listsOfUser_username_filter"
  | "itemsOfList_lid_filter"
  | "privateList_lid_key"
  | "itemsOfPrivateList_lid_key_filter"
  | "isContentSaved_type_id"
  | "saved_posts_uid"
  | "saved_comments_uid"
  | "saved_lists_uid"
  | "notifications_uid"
  | "listCollaborators_lid"
  | "followersOfCurrentUser_uid"
  | "followingOfCurrentUser_uid"
  | "bannedMembers_tid"
  | "threadManagers_tid"
  | "search-followers_uid_query"
  | "search-following_uid_query"
  | "searchMembers_tid_query"
  | "searchBannedMembers_tid_query"
  | "rooms_uid"
  | "messages_rmid"
  | "room_rmid_uid"
  | "roomInvitations_uid"
  | "roomExists_ruid_uid"
  | "reports_cnid"
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
      poster?: string,
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

export type HandlerWrapperProps<T = any> = {
  data: T;
  frames: Frame[];
  user_id: string;
  username: string;
  session: ClientSession;
  req: NextRequest;
  params: { id: string; cuid: string };
};

export type PrecheckProps<T = any> = Omit<
  HandlerWrapperProps<T>,
  "frames" | "session"
>;
export type PrecheckResponse = Omit<GeneralGetReturn, "result">;

export type HandlerResponse<K extends AvailableRevalidateTags> =
  | {
    result: any;
    success: true;
    errCode?: null;
    options: RevalidateTagsArgs<K>;
    available: K;
    revalidateQueue?: undefined;
  }
  | {
    result: any;
    success: true;
    errCode?: null;
    options?: undefined;
    available?: undefined;
    revalidateQueue: string[];
  }
  | {
    result?: null;
    success: false;
    errCode: ErrorCodes;
    options?: undefined;
    available?: undefined;
    revalidateQueue?: undefined;
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

export type PipelineFunc<T = { [key: string]: any }> = (
  __0: {
    filters: PipelineStage[];
    page: number;
    sort?: any;
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
  string
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