import { PipelineStage } from "mongoose";

export type UserBasedButtonProps<T = any> = {
  state: T | null;
  isPending: boolean;
  onClick: (newState: T, action: any) => void;
};

export type AvailableCacheTags =
  | "user_username"
  | "currentUser_uid"
  | "connection_rid_uid"
  | "usernameAvailability_username"
  | "userExistence_email"
  | "threadsByUser_uid"
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
  | "items_lid_filter_page"
  | "savedPosts_uid_page"
  | "savedComments_uid_page"
  | "savedLists_uid_page"
  | "isSaved_uid_id";

export type AvailableRevalidateTags =
  | "registration_email_username"
  | "login_uid"
  | "logout_uid"
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
  | "addItemsInList_lid"
  | "savedPosts_uid"
  | "savedComments_uid"
  | "savedLists_uid"
  | "isSaved_uid_id"
  | "followUnfollow_rid_uid"
  | "blockUnblock_rid_uid";

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
