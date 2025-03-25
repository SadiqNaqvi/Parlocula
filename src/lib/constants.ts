import {
  AvailableCacheTags,
  AvailableRevalidateTags,
  CloudinaryMediaOptions,
  QueryFilterType,
} from "@type/internal";

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

export const postTags = [
  "",
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

export const postLinksLength = 5;

export const urlPattern =
  /^https:\/\/(www\.)?[a-zA-Z0-9-]{2,}(\.[a-zA-Z0-9-]{2,})+(\/[^\s]*)?(\?[^\s]*)?$/;

export const passwordValidator =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

export const usernamePattern = /^[a-z][a-z0-9_]*$/;

export const emailPattern =
  /^[a-zA-Z]+[a-zA-Z0-9-]{2,}\@+[a-z]{4,}\.[a-z]{3,}$/;

export const imgUrl = "https://image.tmdb.org/t/p/";

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

export const allowedImageMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/heic",
];
export const allwedVideoMimeTypes = [
  "video/mp4",
  "video/webm",
  "video/x-matroska",
];

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

export const cloudinary_image_uri =
  "https://res.cloudinary.com/dwpbmrgsx/image/upload/";
export const cloudinary_video_uri =
  "https://res.cloudinary.com/dwpbmrgsx/video/upload/";
export const cloudinary_postKey = "v1731487676";

export const queryLimit = 20;

export const errorCodes: Record<string, { reason: string; message: string }> = {
  pp100: {
    reason: "Server side unknown error.",
    message:
      "Something went wrong on the server side! Please try again but if the error persist, please report it.",
  },
  pp101: {
    reason: "Database connection failure.",
    message:
      "Failed to connect to the database! Please check your connection and try again.",
  },
  pp102: {
    reason: "Media upload failure.",
    message:
      "Unable to upload the media files (images/videos) on our hosting provider! Please try again.",
  },
  pp104: {
    reason: "Resource not found",
    message:
      "Unable to find the resource you're looking for! The resource might have been deleted.",
  },
  pp105: {
    reason: "Data Storing failure",
    message:
      "Unable to store the data in the database! Please try again but if the error persists, report it.",
  },
  pp106: {
    reason: "Session failure",
    message:
      "Your account has been created but we're unable to store a session for you. Please log-in to continue.",
  },
  pp200: {
    reason: "Unstable internet connection of the client.",
    message:
      "Looks like your internet connection is not stable! Please check your connection and try again.",
  },
  pp201: {
    reason: "Unauthorized user trying to access a private resource.",
    message: "You're not allowed to be here or use this feature.",
  },
  pp202: {
    reason: "Un-Authenticated user trying to perform an action.",
    message: "You need to log in to get this resource or perform this action.",
  },
  pp203: {
    reason: "Form Errors issued by zod.",
    message: "",
  },
  pp204: {
    reason: "Invalid Object Id found",
    message: "You have came across a wrong way! Please go back and try again.",
  },
  pp205: {
    reason: "Invalid Input data other than form data.",
    message:
      "You've given us a wrong information! Please check everything and try again.",
  },
  pp206: {
    reason: "User is temporarily banned to perform post requests.",
    message:
      "You're temporarily banned to perform any post requests. Please try again in some days.",
  },
  pp207: {
    reason: "User has blocked the current user.",
    message: "You cannot follow this account since this user has blocked you.",
  },
  pp208: {
    reason: "User has not joined the thread but trying to post in it.",
    message:
      "You need to be a member of the thread before start posting in it.",
  },
  pp500: {
    reason: "Totally unknown error.",
    message: "Something went wrong! Please try again.",
  },
};

export const queryFilters: Record<QueryFilterType, string[]> = {
  threads: ["hot", "latest", "popular"],
  posts: ["hot", "latest", "controversial", "popular"],
  comments: ["loved", "latest"],
  userPosts: ["latest", "oldest", "popular"],
  lists: ["latest, a_to_z", "z_to_a", "recently_added"],
  items: ["latest", "year"],
};

export const filterToSort: Record<QueryFilterType, any> = {
  threads: {
    hot: { createdAt: -1, post_count: -1, user_count: -1 },
    popular: { user_count: -1 },
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
export const oneHour = 60 * 60;
export const oneDay = oneHour * 24;
export const oneWeek = oneDay * 7;

export const cacheTags: Record<AvailableCacheTags, string[]> = {
  user_username: ["user-{username}"],
  currentUser_uid: ["currentUser-{uid}"],
  usernameAvailability_username: ["isUsernameAvailable-{username}"],
  userExistence_email: ["userExist-{email}"],
  filteredPostsOfUser_username_filter_page: [
    "filter-{filter}-posts-user-{username}-page-{page}",
  ],
  filteredPostsOfThread_filter_tid_page: [
    "filter-{filter}-posts-thread-{tid}-page-{page}",
  ],
  filteredFramesOfThread_filter_tid_page: [
    "filter-{filter}-frames-thread-{tid}-page-{page}",
  ],
  filteredLinksOfThread_filter_tid_page: [
    "filter-{filter}-links-thread-{tid}-page-{page}",
  ],
  filteredThreads_filter_page: ["filter-{filter}-threads-page-{page}"],
  threadsByUser_username: ["threads-user-{username}"],
  post_pid: ["post-{pid}"],
  filteredComments_pid_filter_page: [
    "comments-post-{pid}-filter-{filter}-page-{page}",
  ],
  comment_cid: ["comment-{cid}"],
  replies_cid: ["replies-comment-{cid}"],
  reaction_pid_uid: ["reaction-post-{pid}-user-{uid}"],
  connection_rid_uid: ["connection-requestedUser-{rid}-user-{uid}"],
  vote_cid_uid: ["vote-comment-{cid}-user-{uid}"],
  member_tid_uid: ["member-thread-{tid}-user-{uid}"],
  thread_tid: ["thread-{tid}"],
  media_tmdbid: ["media-{tmdbid}"],
  list_lid: ["list-{lid}"],
  items_lid_filter_page: ["items-{lid}-{page}-{filter}"],
};

export const revalidateTags: Record<AvailableRevalidateTags, string[]> = {
  commentCreation_cid_username_pid: [
    "comment-{cid}",
    "latest-comments-user-{username}-page-1",
    "comments-post-{pid}-filter-latest-page-1",
  ],
  commentDeletion_cid_username_pid: [
    "comment-{cid}",
    "latest-comments-user-{username}-page-1",
    "comments-post-{pid}-filter-latest-page-1",
  ],
  joiningThread_tid_username_uid: [
    "member-thread-{tid}-user-{uid}",
    "threads-user-{username}",
  ],
  leavingThread_uid_username_tid: [
    "member-thread-{tid}-user-{uid}",
    "threads-user-{username}",
  ],
  login_uid: ["currentUser-{uid}"],
  logout_uid: ["currentUser-{uid}"],
  connection_rid_uid: ["connection-requestedUser-{rid}-user-{uid}"],
  postCreation_pid_tid_username: [
    "post-{pid}",
    "latest-posts-thread-{tid}-page-1",
    "latest-frames-thread-{tid}-page-1",
    "latest-links-thread-{tid}-page-1",
    "latest-posts-user-{username}-page-1",
  ],
  postUpdation_pid: ["post-{pid}"],
  postDeletion_pid_tid_username: [
    "post-{pid}",
    "latest-posts-thread-{tid}-page-1",
    "latest-frames-thread-{tid}-page-1",
    "latest-links-thread-{tid}-page-1",
    "latest-posts-user-{username}-page-1",
  ],
  reactionCreation_pid_uid: ["reaction-post-{pid}-user-{uid}"],
  reactionDeletion_pid_uid: ["reaction-post-{pid}-user-{uid}"],
  registration_email_username: [
    "userExist-{email}",
    "isUsernameAvailable-{username}",
    "user-{username}",
  ],
  threadCreation_tid_username: ["thread-{tid}", "threads-user-{username}"],
  voteCreation_cid_uid: ["vote-comment-{cid}-user-{uid}"],
  voteDeletion_cid_uid: ["vote-comment-{cid}-user-{uid}"],
  media_tmdbid: ["media-{tmdbid}"],
  listCreation_lid: ["list-{lid}"],
  addItemsInList_lid: ["items-{lid}-1-latest"],
};

export const optimisedImageProps: Record<
  string,
  { width: number; height: number; alt: string; [key: string]: any }
> = {
  poster: {
    height: 128,
    width: 128,
    alt: "Poster",
    priority: true,
    className: "size-32 object-cover rounded-full",
  },
};
