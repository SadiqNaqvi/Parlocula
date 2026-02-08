import { AllShelves } from "@type/models";
import {
  AvailableCacheTags,
  AvailableQueryKeys,
  AvailableRevalidateTags,
  CloudinaryMediaOptions,
  ErrorCodes,
  QueryFilterType,
  ReportReasonType,
} from "@type/other";

export const searchFilters = [
  "all",
  "movies",
  "shows",
  "threads",
  "users",
  "posts",
  "comments",
  "shelves",
  "people",
  "collections",
  "companies",
];

export const app_production_url = process.env.NEXT_PUBLIC_PARLOCULA_URL ?? "https://parlocula.vercel.app";
export const parloculaAppURL =
  process.env.NODE_ENV === "development" ?
    "http://localhost:3000" :
    app_production_url

export const availablePostCategories = [
  "discussion",
  "question",
  "roast/joke",
  "information",
  "theory/speculations",
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

export const megaFilePattern =
  /^https:\/\/mega(\.(nz|io))\/file\/[a-zA-Z0-9-]{3,}(\#)[a-zA-Z0-9-]{5,}$/;

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

export const oneKb = 1024;
export const oneMb = oneKb * oneKb;

export const allowedSizes: Record<string, number> = {
  image: oneMb * 3,
  video: oneMb * 10,
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
export const participantsRemoveOrInviteLimit = 10;
export const participantsLimitForGroup = 50;
export const blockOrBanLimit = 10;
export const shelfCollaboratorsLimit = 10;
export const clientThreadsAndShelvesLimit = 50;

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
  rate_limit_exceed: {
    reason: "User hit rate limit.",
    message: "Oops! Looks like you are doing things too fast. Slow down, calm yourself and try again after some time."
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
  custom_error: {
    reason: "A custom error. Not from anything listed above.",
    message: ""
  },
};

export const queryFilters: Record<QueryFilterType, string[]> = {
  threads: ["hot", "latest", "popular"],
  posts: ["hot", "latest", "controversial", "popular"],
  comments: ["loved", "latest"],
  userPosts: ["latest", "oldest", "popular"],
  shelves: ["latest", "a_to_z", "z_to_a", "recently_added"],
  items: ["latest", "year"],
};

export const mediaInputConfig: Record<
  "image" | "video",
  { accept: string; size: { label: string; value: number } }
> = {
  image: {
    accept: ".jpg, .png, .jpeg, .webp, .avif",
    size: { label: "5mb", value: oneMb * 5 },
  },
  video: {
    accept: ".mp4, .3gp, .mkv, .mov, .m4v",
    size: { label: "100mb", value: oneMb * 100 },
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
  shelves: {
    latest: { createdAt: -1 },
    a_to_z: { title: 1 },
    z_to_z: { title: -1 },
    recently_added: { last_added: -1 },
  },
};

export const oneHour = 3600 * 1000;
export const oneDay = oneHour * 24;
export const oneWeek = oneDay * 7;

export const queryKeys: Record<AvailableQueryKeys, string[]> = {
  user_username: ["user-{username}"],
  searchNonBlockedUser_query_uid: ["searchNonBlockedUser", "{query}", "{uid}"],
  connection_ruid: ["connection-{ruid}"],
  postsOfUser_uid_filter: [
    "posts",
    "{filter}",
    "user",
    "{uid}",
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
  "saved-comments_uid": ["saved", "comments", "{uid}"],
  "saved-shelfs_uid": ["saved", "shelves", "{uid}"],
  "saved-posts_uid": ["saved", "posts", "{uid}"],
  joinedThreadsOfUser_uid: ["joined", "threads", "{uid}"],
  createdThreadsOfUser_uid: ["created", "threads", "{uid}"],
  threadsManageByUser_uid: ["manages", "threads", "{uid}"],
  threads_filter: ["threads", "{filter}"],
  membership_tid: ["membership", "{tid}"],
  bannedMembers_tid: ["banned-members", "{tid}"],
  members_tid: ["members", "{tid}"],
  postsOfThread_tid_filter_category: [
    "posts",
    "{filter}",
    "thread",
    "{tid}",
    "{category}",
  ],
  quotes_pid: ["quotes", "{pid}"],
  post_id: ["post", "{id}"],
  reaction_pid: ["reaction", "{pid}"],
  commentsOfPost_pid_filter: [
    "comments",
    "{filter}",
    "post",
    "{pid}",
  ],
  commentsOfUser_uid_filter: [
    "comments",
    "{filter}",
    "user",
    "{uid}",
  ],
  comment_cid: ["comment", "{cid}"],
  like_cid: ["like", "{cid}"],
  replies_cid_filter: ["replies", "{cid}", "{filter}"],
  shelf_sid: ["shelf", "{sid}"],
  shelvesOfUser_uid_filter: ["shelves-of-user", "{uid}", "{filter}"],
  itemsOfShelf_sid_filter: ["itemsOfShelf", "{sid}", "{filter}"],
  privateShelf_sid_key: ["privateShelf", "{sid}", "{key}"],
  itemsOfPrivateShelf_sid_key_filter: [
    "itemsOfPrivateShelf",
    "{sid}",
    "{filter}",
    "{key}",
  ],
  isContentSaved_type_id: ["saved", "{type}", "{id}"],
  notifications_uid: ["notifications-user", "{uid}"],
  shelfCollaborators_sid: ["collaborators-{sid}"],
  "search-followers_uid_query": ["search", "followers", "{uid}", "{query}"],
  "search-following_uid_query": ["search", "following", "{uid}", "{query}"],
  followersOfCurrentUser_uid: ["followers", "currentUser", "{uid}"],
  followingOfCurrentUser_uid: ["following", "currentUser", "{uid}"],
  blockedByCurrentUser_uid: ["blockedByCurrentUser", "{uid}"],
  rooms_uid: ["rooms", "{uid}"],
  messages_rmid: ["messages", "{rmid}"],
  room_rmid_uid: ["room", "{rmid}", "{uid}"],
  participantsOfRoom_rmid_uid: ["parrticipantsOfRoom", "{rmid}", "{uid}"],
  roomInvitations_uid: ["roomInvitations", "{uid}"],
  roomExists_ruid_uid: ["roomExists", "{ruid}", "{uid}"],
  reports_cnid: ["reports", "{cnid}"],
  reportedContents_type_tid: ["reportedContents", "{type}", "threads", "{tid}"],
  collaboratedShelvesOfUser_uid: ["collaboratedShelvesOfUser", "{uid}"],
  invitedShelvesOfUser_uid: ["invitedShelvesOfUser", "{uid}"],
  privateShelvesOfUser_uid: ["private-shelves-user-{uid}"],
  allShelvesOfUser_uid: ["all-shelves-user-{uid}"],
  shelfConnection_sid: ["shelfConnection", "{sid}"],
  shelfsForCinement_cnid: ["shelfsForCinement", "{cnid}"],
  ifReportExists_cnid_type: ["reportExists", "{cnid}", "{type}"],
  threadsOnCinementOrArtist_id: ["threadsOnCinementOrArtist", "{id}"]
};

export const cacheTags: Record<AvailableCacheTags, string[]> = {
  user_username: ["user-{username}"],
  currentUser_uid: ["currentUser-{uid}"],
  usernameAvailability_username: ["isUsernameAvailable-{username}"],
  userExistence_email: ["userExist-{email}"],
  postsOfUser_uid_filter_page_nsfw: [
    "filter-{filter}-posts-user-{uid}-page-{page}-nsfw-{nsfw}",
  ],
  postsOfThread_filter_tid_page_category_nsfw: [
    "filter-{filter}-posts-thread-{tid}-page-{page}-tag-{category}-nsfw-{nsfw}",
  ],
  threads_filter_page_nsfw: ["filter-{filter}-threads-page-{page}-nsfw-{nsfw}"],
  membersOfThread_tid_page: ["members-thread-{tid}-page-{page}"],
  joinedThreadsOfUser_uid_page: ["threads-user-{uid}-page-{page}"],
  post_pid: ["post-{pid}"],
  commentsOfPost_pid_filter_page_nsfw: [
    "comments-post-{pid}-filter-{filter}-page-{page}-nsfw-{nsfw}",
  ],
  quotedPosts_pid_page_nsfw: ["quotedPosts-post-{pid}-page-{page}-nsfw-{nsfw}"],
  comment_cid: ["comment-{cid}"],
  commentsOfUser_uid_filter_page_nsfw: [
    "filter-{filter}-comments-user-{uid}-page-{page}-nsfw-{nsfw}",
  ],
  replies_cid_filter_page_nsfw: [
    "replies-comment-{cid}-filter-{filter}-page-{page}-nsfw-{nsfw}",
  ],
  reaction_pid_uid: ["reaction-post-{pid}-user-{uid}"],
  connection_rid_uid: ["connection-requestedUser-{rid}-user-{uid}"],
  like_cid_uid: ["likes-comment-{cid}-user-{uid}"],
  member_tid_uid: ["member-thread-{tid}-user-{uid}"],
  thread_tid: ["thread-{tid}"],
  cinement_extid: ["cinement-{extid}"],
  shelf_sid_key: ["shelf-{sid}-{key}"],
  shelvesOfUser_uid_filter_page: [
    "shelves-user-{uid}-filter-{filter}-page-{page}",
  ],
  privateShelvesOfUser_uid_page: [
    "private-shelves-user-{uid}-page-{page}",
  ],
  allShelvesOfUser_uid_page: ["allShelves-user-{uid}-page-{page}"],
  shelvesForCinement_cid_uid: ["shelvesForCinement-{cid}-user-{uid}"],
  items_sid_filter_page_key: ["items-{sid}-{page}-{filter}-{key}"],
  "saved-posts_uid_page": ["savedPosts-user-{uid}", "page-{page}"],
  "saved-comments_uid_page": ["savedComments-user-{uid}", "page-{page}"],
  "saved-shelfs_uid_page": ["savedShelves-user-{uid}", "page-{page}"],
  isSaved_uid_id: ["isSaved-uid-{uid}-content-{id}"],
  notifications_uid_page: ["notifications-user-{uid}-page-{page}"],
  threadManagers_tid: ["managers-thread-{tid}"],
  shelfCollaborators_sid: ["shelf-collaborators-{sid}"],
  followersOfUser_uid_page: ["followers-user-{uid}", "page-{page}"],
  followingOfUser_uid_page: ["following-user-{uid}", "page-{page}"],
  blockedByUser_uid_page: ["blockedByUser-user-{uid}-page-{page}"],
  roomInvitations_uid: ["roomInvitations-{uid}"],
  room_rmid_ruid_uid: ["room-rmid-{rmid}-ruid-{ruid}-cuid-{uid}"],
  reports_cnid: ["reports-{cnid}"],
  reportExists_cnid_uid: ["reportExists-{cnid}-{uid}"],
  collaborativeShelvesOfUser_uid_page: ["collaborativeShelvesOfUser-{uid}-{page}"],
  invitedShelvesOfUser_uid_page: ["invitedShelvesOfUser-{uid}-{page}"],
  isShelfCollaborator_uid_sid: ["isShelfCollaborator-{uid}-{sid}"],
};

export const revalidateTags: Record<AvailableRevalidateTags, string[]> = {
  commentMutation_cid_uid_pid: [
    "comment-{cid}",
    "filter-latest-comments-user-{uid}-page-1-nsfw-true",
    "filter-latest-comments-user-{uid}-page-1-nsfw-false",
    "comments-post-{pid}-filter-latest-page-1-nsfw-true",
    "comments-post-{pid}-filter-latest-page-1-nsfw-false",
    "replies-comment-{cid}-filter-latest-page-1-nsfw-true",
    "replies-comment-{cid}-filter-latest-page-1-nsfw-false",
  ],
  commentUpdation_cid: ["comment-{cid}"],

  threadMembershipMutation_tid_uid: [
    "member-thread-{tid}-user-{uid}",
    "members-thread-{tid}-page-1",
    "threads-user-{uid}-page-1",
  ],
  notifications_uid: ["notifications-user-{uid}"],
  loginLogout_uid: ["currentUser-{uid}"],
  postMutation_pid_tid_uid_category: [
    "post-{pid}",
    "filter-latest-posts-thread-{tid}-page-1-tag-{category}-nsfw-true",
    "filter-latest-posts-thread-{tid}-page-1-tag-{category}-nsfw-false",
    "filter-latest-posts-user-{uid}-page-1-nsfw-true",
    "filter-latest-posts-user-{uid}-page-1-nsfw-false",
  ],
  postUpdation_pid: ["post-{pid}"],
  reactionMutation_pid_uid: ["reaction-post-{pid}-user-{uid}"],
  registration_email_username: [
    "userExist-{email}",
    "isUsernameAvailable-{username}",
    "user-{username}",
  ],
  threadMutation_tid: ["thread-{tid}"],
  likesMutation_cid_uid_author: [
    "likes-comment-{cid}-user-{uid}",
    "notifications-user-{author}",
  ],
  cinement_extid: ["cinement-{extid}"],
  shelfMutation_sid_uid_key: [
    "shelf-{sid}-{key}",
    "shelves-user-{uid}-filter-latest-page-1",
    "private-shelves-user-{uid}-page-1",
    "allShelves-user-{uid}-page-1"
  ],
  shelfUpdation_sid_key: ["shelf-{sid}-{key}"],
  shelfCollaboratorMutation_uid_sid: ["shelf-collaborators-{sid}", "shelf-{sid}-{key}", "isShelfCollaborator-{uid}-{sid}"],
  addItemsInShelf_sid: ["items-{sid}-1-latest"],
  savedPosts_uid: ["savedPosts-user-{uid}"],
  savedComments_uid: ["savedComments-user-{uid}"],
  savedShelves_uid: ["savedShelves-user-{uid}"],
  isSaved_uid_id: ["isSaved-uid-{uid}-content-{id}"],
  followUnfollow_rid_uid: [
    "connection-requestedUser-{rid}-user-{uid}",
    "followers-user-{uid}",
    "following-user-{rid}",
  ],
  blockUnblock_rid_uid: [
    "connection-requestedUser-{uid}-user-{rid}",
    "blockedByUser-user-{uid}-page-1"
  ],
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
  threadManagersMutation_tid_uid: [
    "managers-thread-{tid}",
    "thread-{tid}",
    "member-thread-{tid}-user-{uid}"
  ],
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

export const predefinedShelves: AllShelves[] = ["favourite", "recommended", "watched"];

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
