import { AllListType } from "@type/models";
import {
  AvailableCacheTags,
  AvailableQueryKeys,
  AvailableRevalidateTags,
  CloudinaryMediaOptions,
  ErrorCodes,
  QueryFilterType,
  ReportReasonType,
} from "@type/other";

export const movie_genres: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  sciencefiction: 878,
  tvmovie: 10770,
  thriller: 53,
  war: 10752,
  western: 37,
};

export const show_genres: Record<string, number> = {
  action: 10759,
  adventure: 10759,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  kids: 10762,
  mystery: 9648,
  news: 10763,
  reality: 10764,
  scifi: 10765,
  fantasy: 10765,
  soap: 10766,
  talk: 10767,
  war: 10768,
  politics: 10768,
  western: 37,
};

export const genresToChoose = [
  "action",
  "adventure",
  "animation",
  "comedy",
  "thriller",
  "crime",
  "drama",
  "family",
  "fantasy",
  "horror",
  "mystery",
  "romance",
  "science fiction",
  "war",
  "tv movie",
  "music",
  "history",
  "documentary",
  "western",
];

export const searchFilters = [
  "all",
  "movies",
  "shows",
  "threads",
  "users",
  "posts",
  "comments",
  "lists",
  "people",
  "collections",
  "companies",
];

export const postTags = [
  "discussion",
  "question",
  "roast/joke",
  "information",
  "frames",
  "links",
  "others",
];

export const numberOfFrames = {
  total: 5,
  images: 3,
  videos: 2,
};

export const urlPattern =
  /^https:\/\/(www\.)?[a-zA-Z0-9-]{2,}(\.[a-zA-Z0-9-]{2,})+(\/[^\s]*)?(\?[^\s]*)?$/;

export const mediaUrlPattern =
  /^(https:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-%.~+\/]*)*(\.(jpg|jpeg|png|bmp|webp|mp4|mov|avi|mkv|flv|wmv|webm|3gp))(?=[\/?]|$)/i;

export const passwordValidator =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

export const usernamePattern = /^[a-z][a-z0-9_]*$/;

export const emailPattern =
  /^[a-zA-Z]+[a-zA-Z0-9-]{2,}\@+[a-z]{4,}\.[a-z]{3,}$/;

export const externalImgUrlPrefix = "https://image.tmdb.org/t/p/";

export const backdrop_sizes = ["w300", "w780", "w1280", "original"];
export const logo_sizes = [
  "w45",
  "w92",
  "w154",
  "w185",
  "w300",
  "w500",
  "original",
];
export const poster_sizes = [
  "w92",
  "w154",
  "w185",
  "w342",
  "w500",
  "w780",
  "original",
];
export const profile_sizes = ["w45", "w185", "h632", "original"];
export const still_sizes = ["w92", "w185", "w300", "original"];

export const allowedSizes: Record<string, number> = {
  image: 1024 * 1024 * 3,
  video: 1024 * 1024 * 10,
};

export const allowedFormats: Record<string, string[]> = {
  image: ["jpg", "png", "jpeg", "webp", "bmp", "tiff", "tif", "heic"],
  video: ["mp4", "webm", "mkv"],
};

export const cloudinary_media_options: Record<CloudinaryMediaOptions, string> =
{
  aspect_ratio: "ar_",
  crop: "c_",
  width: "w_",
  height: "h_",
  quality: "q_",
  filter: "f_",
  round: "r_",
};

export const cloudinary_uri = "https://res.cloudinary.com/dwpbmrgsx/";
export const cloudinary_postKey = "v1731487676";

export const queryLimit = 20;
export const recentlyJoinedLimit = 20;
export const emailLimit = 3;
export const postLinksLength = 5;
export const threadManagersLimit = 10;
export const blockOrBanLimit = 10;
export const listCollaboratorsLimit = 10;
export const clientThreadsAndListsLimit = 50;

export const errorCodes: Record<ErrorCodes, { reason: string; message: string }> = {
  unknown_error: {
    reason: "Server side unknown error.",
    message:
      "Something went wrong on the server side! Please try again but if the error persist, please report it.",
  },
  database_connection_fail: {
    reason: "Database connection failure.",
    message:
      "Failed to connect to the database! Please check your connection and try again.",
  },
  media_upload_fail: {
    reason: "Media upload failure.",
    message:
      "Unable to upload the media files (images/videos) on our hosting provider! Please try again.",
  },
  resource_not_found: {
    reason: "Resource not found",
    message:
      "Unable to find the resource you're looking for! The resource might have been deleted.",
  },
  data_storing_fail: {
    reason: "Data Storing failure",
    message:
      "Unable to store the data in the database! Please try again but if the error persists, report it.",
  },
  session_store_fail: {
    reason: "Session failure",
    message:
      "Your account has been created but we're unable to store a session for you. Please log-in to continue.",
  },
  unstable_internet: {
    reason: "Unstable internet connection of the client.",
    message:
      "Looks like your internet connection is not stable! Please check your connection and try again.",
  },
  unauthorized_access: {
    reason: "Unauthorized user trying to access a private resource.",
    message: "You're not allowed to be here or use this feature.",
  },
  unauthenticated_access: {
    reason: "Un-Authenticated user trying to perform an action.",
    message: "You need to log in to perform this action.",
  },
  form_error: {
    reason: "Form Errors issued by zod.",
    message: "",
  },
  invalid_object_id: {
    reason: "Invalid Object Id found",
    message: "You have came across a wrong way! Please go back and try again.",
  },
  invalid_input: {
    reason: "Invalid Input data other than form data.",
    message:
      "You've given us a wrong information! Please check everything and try again.",
  },
  temporary_banned: {
    reason: "User is temporarily banned to perform post requests.",
    message:
      "You're temporarily banned to perform any post requests. Please try again in some days.",
  },
  blocked_by_author: {
    reason:
      "A post request could not complete because the current user is blocked by the author of the content.",
    message: "Something went wrong.",
  },
  not_a_member: {
    reason: "User has not joined the thread but trying to post in it.",
    message:
      "You need to be a member of the thread before start posting in it.",
  },
  email_verification_limit_exceed: {
    reason: "User has reached email verification limit.",
    message:
      "Unable to verify email. Please wait for about an hour and try again.",
  },
  wrong_passkey: {
    reason: "User has provided a wrong passkey while updating their info.",
    message: "Passkey is incorrect. Please try again",
  },
  early_identification_update: {
    reason:
      "User is trying to update identification fields i.e. username or email, within a month of last update.",
    message:
      "You cannot perform this action yet. Please wait for a month and try again.",
  },
  invalid_verification_code: {
    reason: "Incorrect verification code.",
    message: "Incorrect Code! Please try again.",
  },
  verification_code_expired: {
    reason: "Verification Code expired.",
    message: "Verification code has been expired! Please try again.",
  },
  uncaught_error: {
    reason: "Totally unknown error.",
    message: "Something went wrong! Please try again.",
  },
  missing_device_fingerprint: {
    reason: "Device fingerprint is not provided or stored.",
    message: "Looks like your device is un-registered. Please try re-sending verification email and try again."
  },
  unregistered_user: {
    reason: "User is not registered. This is not an error but a information to client that user needs to register first.",
    message: ""
  },
};

export const queryFilters: Record<QueryFilterType, string[]> = {
  threads: ["hot", "latest", "popular"],
  posts: ["hot", "latest", "controversial", "popular"],
  comments: ["loved", "latest"],
  userPosts: ["latest", "oldest", "popular"],
  lists: ["latest", "a_to_z", "z_to_a", "recently_added"],
  items: ["latest", "year"],
};

export const mediaInputConfig: Record<
  "image" | "video",
  { accept: string; size: { label: string; value: number } }
> = {
  image: {
    accept: ".jpg, .png, .jpeg, .webp, .avif",
    size: { label: "3mb", value: 1024 * 1024 * 3 },
  },
  video: {
    accept: ".mp4, .3gp, .mkv, .mov, .m4v",
    size: { label: "10mb", value: 1024 * 1024 * 10 },
  },
};

export const filterToSort: Record<QueryFilterType, any> = {
  threads: {
    hot: { createdAt: -1, post_count: -1, member_count: -1 },
    popular: { member_count: -1 },
    latest: { createdAt: -1 },
  },
  posts: {
    hot: { createdAt: -1, reaction_count: -1 },
    controversial: { createdAt: -1, comment_count: -1 },
    latest: { createdAt: -1 },
    popular: { reaction_count: -1 },
  },
  comments: {
    latest: { createdAt: -1 },
    loved: { comment_count: -1 },
  },
  userPosts: {
    latest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    popular: { reaction_count: -1 },
  },
  items: {
    latest: { createdAt: -1 },
    year: { year: -1 },
  },
  lists: {
    latest: { createdAt: -1 },
    a_to_z: { title: 1 },
    z_to_z: { title: -1 },
    recently_added: { last_added: -1 },
  },
};

export const oneHour = 3600;
export const oneDay = oneHour * 24;
export const oneWeek = oneDay * 7;

export const queryKeys: Record<AvailableQueryKeys, string[]> = {
  user_username: ["user-{username}"],
  connection_ruid: ["connection-{ruid}"],
  postsOfUser_username_filter: [
    "posts",
    "{filter}",
    "user",
    "{username}",
  ],
  searchBannedMembers_tid_query: [
    "search",
    "bannedMembers",
    "{tid}",
    "{query}",
  ],
  searchMembers_tid_query: ["search", "members", "{tid}", "{query}"],
  thread_id: ["thread", "{id}"],
  threadManagers_tid: ["threadManagers", "{tid}"],
  saved_comments_uid: ["saved", "comments", "{uid}"],
  saved_lists_uid: ["saved", "lists", "{uid}"],
  saved_posts_uid: ["saved", "posts", "{uid}"],
  threadOfUser_uid: ["threads", "{uid}"],
  threads_filter: ["threads", "{filter}"],
  membership_tid: ["membership", "{tid}"],
  bannedMembers_tid: ["banned-members", "{tid}"],
  members_tid: ["members", "{tid}"],
  postsOfThread_tid_filter_tag: [
    "posts",
    "{filter}",
    "thread",
    "{tid}",
    "{tag}",
  ],
  reposts_pid: ["reposts", "{pid}"],
  post_id: ["post", "{id}"],
  reaction_pid: ["reaction", "{pid}"],
  commentsOfPost_pid_filter: [
    "comments",
    "{filter}",
    "post",
    "{pid}",
  ],
  commentsOfUser_username_filter: [
    "comments",
    "{filter}",
    "user",
    "{username}",
  ],
  comment_cid: ["comment", "{cid}"],
  vote_cid: ["vote", "{cid}"],
  replies_cid_filter: ["replies", "{cid}", "{filter}"],
  list_lid: ["list", "{lid}"],
  listsOfUser_username_filter: ["lists-of-user", "{username}", "{filter}"],
  itemsOfList_lid_filter: ["items", "{lid}", "{filter}", "list"],
  privateList_lid_key: ["privateList", "{lid}", "{key}"],
  itemsOfPrivateList_lid_key_filter: [
    "items",
    "{lid}",
    "{filter}",
    "privateList",
    "{key}",
  ],
  isContentSaved_type_id: ["saved", "{type}", "{id}"],
  notifications_uid: ["notifications-user", "{uid}"],
  listCollaborators_lid: ["collaborators-{lid}"],
  "search-followers_uid_query": ["search", "followers", "{uid}", "{query}"],
  "search-following_uid_query": ["search", "following", "{uid}", "{query}"],
  followersOfCurrentUser_uid: ["followers", "currentUser", "{uid}"],
  followingOfCurrentUser_uid: ["following", "currentUser", "{uid}"],
  rooms_uid: ["rooms", "{uid}"],
  messages_rmid: ["messages", "{rmid}"],
  room_rmid_uid: ["room", "{rmid}", "{uid}"],
  roomInvitations_uid: ["roomInvitations", "{uid}"],
  roomExists_ruid_uid: ["roomExists", "{ruid}", "{uid}"],
  reports_cnid: ["reports", "{cnid}"],
  reportedContents_type_tid: ["reportedContents", "{type}", "threads", "{tid}"]
};

export const cacheTags: Record<AvailableCacheTags, string[]> = {
  user_username: ["user-{username}"],
  currentUser_uid: ["currentUser-{uid}"],
  usernameAvailability_username: ["isUsernameAvailable-{username}"],
  userExistence_email: ["userExist-{email}"],
  postsOfUser_username_filter_page: [
    "filter-{filter}-posts-user-{username}-page-{page}",
  ],
  commentsOfUser_username_filter_page: [
    "filter-{filter}-comments-user-{username}-page-{page}",
  ],
  postsOfThread_filter_tid_page_tag: [
    "filter-{filter}-posts-thread-{tid}-page-{page}-tag-{tag}",
  ],
  filteredThreads_filter_page: ["filter-{filter}-threads-page-{page}"],
  membersOfThread_tid_page: ["members-thread-{tid}-page-{page}"],
  threadsByUser_uid_page: ["threads-user-{uid}-page-{page}"],
  post_pid: ["post-{pid}"],
  filteredComments_pid_filter_page: [
    "comments-post-{pid}-filter-{filter}-page-{page}",
  ],
  reposts_pid_page: ["reposts-post-{pid}-page-{page}"],
  comment_cid: ["comment-{cid}"],
  replies_cid_filter_page: [
    "replies-comment-{cid}-filter-{filter}-page-{page}",
  ],
  reaction_pid_uid: ["reaction-post-{pid}-user-{uid}"],
  connection_rid_uid: ["connection-requestedUser-{rid}-user-{uid}"],
  vote_cid_uid: ["vote-comment-{cid}-user-{uid}"],
  member_tid_uid: ["member-thread-{tid}-user-{uid}"],
  thread_tid: ["thread-{tid}"],
  media_tmdbid: ["media-{tmdbid}"],
  list_lid_key: ["list-{lid}-{key}"],
  listsOfUser_filter_username_page: [
    "lists-user-{username}-filter-{filter}-page-{page}",
  ],
  privateListsOfUser_filter_uid_page: [
    "private-lists-user-{uid}-filter-{filter}-page-{page}",
  ],
  listsForMedia_mid_uid: ["listsForMedia-{mid}-user-{uid}"],
  items_lid_filter_page_key: ["items-{lid}-{page}-{filter}-{key}"],
  "saved-posts_uid_page": ["savedPosts-user-{uid}", "page-{page}"],
  "saved-comments_uid_page": ["savedComments-user-{uid}", "page-{page}"],
  "saved-lists_uid_page": ["savedLists-user-{uid}", "page-{page}"],
  isSaved_uid_id: ["isSaved-uid-{uid}-content-{id}"],
  notifications_uid_page: ["notifications-user-{uid}-page-{page}"],
  threadManagers_tid: ["managers-thread-{tid}"],
  listCollaborators_lid: ["list-collaborators-{lid}"],
  followersOfUser_uid_page: ["followers-user-{uid}", "page-{page}"],
  followingOfUser_uid_page: ["following-user-{uid}", "page-{page}"],
  roomInvitations_uid: ["roomInvitations-{uid}"],
  room_rmid_ruid_uid: ["room-rmid-{rmid}-ruid-{ruid}-cuid-{uid}"],
  reports_cnid: ["reports-{cnid}"],
  reportExists_cnid_uid: ["reportExists-{cnid}-{uid}"]
};

export const revalidateTags: Record<AvailableRevalidateTags, string[]> = {
  commentMutation_cid_username_pid: [
    "comment-{cid}",
    "filter-latest-comments-user-{username}-page-1",
    "comments-post-{pid}-filter-latest-page-1",
    "replies-comment-{cid}-filter-latest-page-1",
  ],
  commentUpdation_cid: ["comment-{cid}"],
  threadMembershipMutation_tid_uid: [
    "member-thread-{tid}-user-{uid}",
    "members-thread-{tid}-page-1",
    "threads-user-{uid}-page-1",
  ],
  notifications_uid: ["notifications-user-{uid}"],
  loginLogout_uid: ["currentUser-{uid}"],
  postMutation_pid_tid_username_tag: [
    "post-{pid}",
    "filter-latest-posts-thread-{tid}-page-1-tag-{tag}",
    "filter-latest-posts-user-{username}-page-1",
  ],
  postUpdation_pid: ["post-{pid}"],
  reactionMutation_pid_uid: ["reaction-post-{pid}-user-{uid}"],
  registration_email_username: [
    "userExist-{email}",
    "isUsernameAvailable-{username}",
    "user-{username}",
  ],
  threadMutation_tid: ["thread-{tid}"],
  voteMutation_cid_uid_author: [
    "vote-comment-{cid}-user-{uid}",
    "notifications-user-{author}",
  ],
  media_tmdbid: ["media-{tmdbid}"],
  listMutation_lid_username: [
    "list-{lid}",
    "lists-user-{username}-filter-latest-page-2",
  ],
  listUpdation_lid: ["list-{lid}"],
  listCollaboratorsMutation_lid: ["list-collaborators-{lid}", "list-{lid}"],
  addItemsInList_lid: ["items-{lid}-1-latest"],
  savedPosts_uid: ["savedPosts-user-{uid}"],
  savedComments_uid: ["savedComments-user-{uid}"],
  savedLists_uid: ["savedLists-user-{uid}"],
  isSaved_uid_id: ["isSaved-uid-{uid}-content-{id}"],
  followUnfollow_rid_uid: [
    "connection-requestedUser-{rid}-user-{uid}",
    "followers-user-{uid}",
    "following-user-{rid}",
  ],
  blockUnblock_rid_uid: ["connection-requestedUser-{uid}-user-{rid}"],
  userMutation_uid_username: ["user-{username}", "currentUser-{uid}"],
  userUsernameMutation_uid_oldUsername_newUsername: [
    "user-{oldUsername}",
    "user-{newUsername}",
    "currentUser-{uid}",
    "isUsernameAvailable-{oldUsername}",
    "isUsernameAvailable-{newUsername}",
  ],
  userEmailMutation_uid_oldEmail_newEmail: [
    "userExist-{oldEmail}",
    "userExist-{newEmail}",
    "currentUser-{uid}",
  ],
  threadInviteesMutation_tid: ["managers-thread-{tid}"],
  threadManagersMutation_tid: ["managers-thread-{tid}", "thread-{tid}"],
  roomInvitations_uid: ["roomInvitations-{uid}"],
};

export const optimisedImageProps: Record<
  string,
  { width: number; height: number; alt: string;[key: string]: any }
> = {
  poster: {
    height: 128,
    width: 128,
    alt: "Poster",
    priority: true,
    className: "size-32 object-cover rounded-full",
  },
};

export const listsToChoose: AllListType[] = ["favourite", "recommended"];
export const predefinedLists: AllListType[] = ["favourite", "recommended", "watched"];
export const listsToShow = [
  "favourite",
  "recommended",
  "watched",
  "saved",
  "private",
];

const commonReportOptions: ReportReasonType[] = [
  "Spam or Promoting Spam",
  "Harassment/Threatening",
  "Hate/Abuse",
  "Promoting or Mentioning illegal activities",
  "Promoting/Selling Items",
  "Attached Malicious/Harmful Links",
  "Promoting/Performing Self harm or Suicide",
  "Spreading False Information",
];

export const contentReportOptions: ReportReasonType[] = [
  "Flag as NSFW",
  "Flag as Spoiler",
  "Minor Abuse or Sexualization",
  "Inappropriate Content",
  ...commonReportOptions,
];

export const userReportOptions: ReportReasonType[] = [
  ...commonReportOptions,
  "Impersonation/Pretending to be someone else",
  "No Longer Active",
  "Scam or Fraud",
  "Under-age User",
];

export const threadReportOptions: ReportReasonType[] = [
  ...commonReportOptions,
  "Duplicate Thread",
];
