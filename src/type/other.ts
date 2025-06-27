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
  | "list_lid_key"
  | "listsOfUser_filter_username_page"
  | "privateListsOfUser_filter_uid_page"
  | "items_lid_filter_page_key"
  | "saved_posts_uid_page"
  | "saved_comments_uid_page"
  | "saved_lists_uid_page"
  | "isSaved_uid_id"
  | "listsForMedia_mid_uid";

export type AvailableRevalidateTags =
  | "registration_email_username"
  | "loginLogout_uid"
  | "userMutation_uid_username"
  | "userUsernameMutation_uid_oldUsername_newUsername"
  | "userEmailMutation_uid_oldEmail_newEmail"
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
  | "threadOfUser_uid"
  | "threads_filter"
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
  | "isContentSaved_type_id"
  | "saved_posts_uid"
  | "saved_comments_uid"
  | "saved_lists_uid";

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

// export type getPosterFunctionProps = {
//   path?: string | null | undefined;
// } & (
//   | {
//       external: undefined | false;
//       type?: "image" | "video";
//     }
//   | ({ external: true } & (
//       | {
//           type: "backdrop";
//           size: backdrop_sizes;
//         }
//       | {
//           type: "logo";
//           size: logo_sizes;
//         }
//       | {
//           type: "poster";
//           size: poster_sizes;
//         }
//       | {
//           type: "profile";
//           size: profile_sizes;
//         }
//       | {
//           type: "still";
//           size: still_sizes;
//         }
//     ))
// );
