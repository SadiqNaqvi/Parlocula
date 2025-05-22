import { PipelineStage } from "mongoose";

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
  | "list_lid"
  | "listsOfUser_filter_username_page"
  | "items_lid_filter_page"
  | "savedPosts_uid_page"
  | "savedComments_uid_page"
  | "savedLists_uid_page"
  | "isSaved_uid_id"
  | "listsForMedia_mid_uid";

export type AvailableRevalidateTags =
  | "registration_email_username"
  | "loginLogout_uid"
  | "threadMutation_tid"
  | "threadMembershipMutation_tid_uid"
  | "postMutation_pid_tid_username_tag"
  | "postUpdation_pid"
  | "reactionMutation_pid_uid"
  | "commentMutation_cid_username_pid"
  | "commentUpdation_cid"
  | "voteMutation_cid_uid"
  | "media_tmdbid"
  | "listMutation_lid_username"
  | "listUpdation_lid"
  | "addItemsInList_lid"
  | "savedPosts_uid"
  | "savedComments_uid"
  | "savedLists_uid"
  | "isSaved_uid_id"
  | "followUnfollow_rid_uid"
  | "blockUnblock_rid_uid";

export type AvailableQueryKeys =
  | "user_username"
  | "connection_ruid"
  | "postsOfUser_username_filter_page"
  | "thread_id"
  | "members_tid_page"
  | "membership_tid"
  | "postsOfThread_tid_filter_page_tag"
  | "post_id"
  | "reaction_pid"
  | "commentsOfPost_pid_filter_page"
  | "reposts_pid_page"
  | "commentsOfUser_username_filter_page"
  | "comment_cid"
  | "vote_cid"
  | "replies_cid_filter_page"
  | "list_lid"
  | "listsOfUser_username_filter"
  | "itemsOfList_lid_filter_page"
  | "privateList_lid_key"
  | "itemsOfPrivateList_lid_key_filter_page"
  | "isContentSaved_type_id";

export type AvailableMutationKeys =
  | "postMutation_username_tid_tag"
  | "commentMutation_pid_username";

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

export type PipelineFunc<T = { [key: string]: any }> = (
  __0: {
    filters: any[];
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
