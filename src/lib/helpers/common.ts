import { getCacheTags, objectToFormData } from "@lib/utils";
import {
  AggregatedResponse,
  CurrentUser,
  FullCinementType,
  FullComment,
  FullPost,
  FullRoomType,
  FullShelf,
  GeneralGetReturn,
  GeneralMultipleReturn,
  MereComment,
  MereMessage,
  MerePost,
  MereRoomType,
  MereShelf,
  MereThread,
  MereUser,
  ReportsType,
  RequestedUser,
  SearchedRoom,
  ShelfCollaborators,
  ShelfItemType,
  ShelvesForCinement,
  Thread,
  ThreadModType,
} from "@type/internal";
import { CollaboratorModelType, NotificationModelType, ReportModelType } from "@type/models";
import { AvailableCacheTags, CookiesType, PPGetDataProps } from "@type/other";
import axios from "axios";
import { oneDay, parloculaAppURL, queryFilters } from "../constants";

export const ppGetData = async <T, K extends AvailableCacheTags = any>(
  { url, revalidate, tag, options, cookies, searchParams }: PPGetDataProps<K>
): Promise<GeneralGetReturn<T>> => {

  const cacheTags = tag && options ? getCacheTags(tag, options) : undefined;
  const jar = cookies?.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

  const urlToFetch = new URL(url, `${parloculaAppURL}/api/v1/`);

  Object.entries(searchParams ?? {}).forEach(([k, v]) => {
    urlToFetch.searchParams.set(k, `${v}`);
  });

  console.log(urlToFetch.href, url, searchParams);

  try {

    return await fetch(urlToFetch.href, {
      next: { revalidate: revalidate ?? 0, tags: cacheTags },
      cache: revalidate ? "force-cache" : "no-cache",
      headers: jar ? { Cookie: jar } : undefined,
    }).then((res) => res.json());

  } catch (err: any) {

    console.error(`Error occured at path ${url}`, err.message);

    return { success: false, errCode: "unstable_internet" };
  }
};

export const getCurrentUser = async (id: string, cookies?: CookiesType) =>
  await ppGetData<CurrentUser>({
    url: `private/${id}/user`,
    revalidate: oneDay * 2,
    tag: "currentUser_uid",
    options: { uid: id },
    cookies,
  });

export const getUserFeed = async (cuid: string, page: string, cookies?: CookiesType) =>
  await ppGetData({
    url: `private/${cuid}/feed`
  })

export const isUsernameAvailable = async (username: string) =>
  await ppGetData({
    url: "user/isUsernameAvailable",
    searchParams: { username },
    revalidate: oneDay * 2,
    tag: "usernameAvailability_username",
    options: { username },
  });

export const checkIfUserExist = async (email: string) => await ppGetData({
  url: "user/ifUserExist",
  searchParams: { email },
  revalidate: oneDay * 2,
  tag: "userExistence_email",
  options: { email },
});

export const getThreadById = async (id: string) => await ppGetData<Thread>({
  url: `thread/${id}`,
  revalidate: oneDay * 3,
  tag: "thread_tid",
  options: { tid: id },
});

export const getThreads = async (page: number, nsfw: boolean, filter = queryFilters.threads[0]) =>
  await ppGetData<AggregatedResponse<MereThread>>({
    url: "thread",
    searchParams: { f: filter, p: page, nsfw },
    revalidate: oneDay,
    tag: "threads_filter_page_nsfw",
    options: { filter: filter, nsfw },
  });

export const getMembers = async (tid: string, page: number) =>
  await ppGetData<AggregatedResponse<MereUser>>({
    url: `thread/${tid}/members`,
    searchParams: { p: page },
    revalidate: oneDay,
    tag: "membersOfThread_tid_page",
    options: { page: String(page), tid },
  });

export const isMember = async (
  tid: string,
  uid: string,
  cookies?: CookiesType
): Promise<GeneralGetReturn> => {
  if (!uid) return { success: false, errCode: "unauthenticated_access" };
  const response = await ppGetData({
    url: `private/${uid}/thread/${tid}/member`,
    revalidate: oneDay * 2,
    tag: "member_tid_uid",
    options: { tid, uid },
    cookies,
  });

  return response;
};

export const searchMembers = async (tid: string, query: string, page: number) =>
  await ppGetData<AggregatedResponse<MereUser>>({
    url: `search/members/${tid}`,
    searchParams: { p: page, q: query }
  });

export const joinedThreadsOfUser = async (
  uid: string,
  page = 1,
  cookies?: CookiesType,
) =>
  await ppGetData<AggregatedResponse<MereThread>>({
    url: `private/${uid}/thread/user/joined`,
    searchParams: { p: page },
    revalidate: oneDay * 2,
    tag: "joinedThreadsOfUser_uid_page",
    options: { uid, page },
    cookies,
  });

export const createdThreadsOfUser = async (uid: string, page = 1, cookies?: CookiesType) =>
  await ppGetData<AggregatedResponse<MereThread>>({
    url: `private/${uid}/thread/user/created`,
    searchParams: { p: page },
    revalidate: oneDay * 2,
    cookies,
  });

export const threadsManageByUser = async (uid: string, page = 1, cookies?: CookiesType) =>
  await ppGetData<AggregatedResponse<MereThread>>({
    url: `private/${uid}/thread/user/manages`,
    searchParams: { p: page },
    revalidate: oneDay * 2,
    cookies,
  });

export const getPostsOfThread = async (
  tid: string,
  page: number,
  nsfw: boolean,
  filter = queryFilters.posts[0],
  type: "posts" | "frames" | "links",
  category = "",
): Promise<GeneralMultipleReturn> =>
  await ppGetData({
    url: "post/thread",
    searchParams: {
      p: page,
      f: filter,
      c: category,
      t: type,
      nsfw,
    },
    revalidate: oneDay,
    tag: "postsOfThread_filter_tid_page_category_nsfw",
    options: { filter, tid, page, category, nsfw },
  });

export const getPostsOfUser = async (
  uid: string,
  page: number,
  nsfw: boolean,
  filter = queryFilters.posts[0]
) =>
  await ppGetData<AggregatedResponse<MerePost>>({
    url: `post/user/${uid}`,
    searchParams: { p: page, f: filter, nsfw },
    revalidate: oneDay * 3,
    tag: "postsOfUser_uid_filter_page_nsfw",
    options: { filter, uid, page },
  });

export const getReactionOnPost = async (pid: string, uid: string, cookies?: CookiesType) =>
  await ppGetData({
    url: `private/${uid}/post/${pid}/reaction`,
    revalidate: oneDay * 2,
    tag: "reaction_pid_uid",
    options: { pid, uid },
    cookies,
  });

export const getCommentsOfUser = async (
  uid: string,
  page: number,
  nsfw: boolean,
  filter = queryFilters.comments[0],
) =>
  await ppGetData<AggregatedResponse<MereComment>>({
    url: `comment/user/${uid}`,
    searchParams: { p: page, f: filter, nsfw },
    revalidate: oneDay * 3,
    tag: "commentsOfUser_uid_filter_page_nsfw",
    options: { filter, uid, page, nsfw },
  });

export const getShelvesOfUser = async (
  uid: string,
  page: number,
  filter = queryFilters.shelves[0]
) =>
  await ppGetData<AggregatedResponse<MereShelf>>({
    url: `shelves/${uid}`,
    searchParams: { p: page, f: filter },
    revalidate: oneDay * 3,
    tag: "shelvesOfUser_filter_username_page",
    options: { filter, uid, page },
  });

export const getPrivateShelvesOfUser = async (
  uid: string,
  page: number,
  filter = queryFilters.shelves[0]
) =>
  await ppGetData<AggregatedResponse<MereShelf>>({
    url: `private/${uid}/shelf`,
    searchParams: { p: page, f: filter },
    revalidate: oneDay * 3,
    tag: "privateShelvesOfUser_uid_filter_page",
    options: { filter, uid, page },
  });

export const getShelvesAsCollaborator = async (uid: string, page: number) =>
  await ppGetData<AggregatedResponse<MereShelf>>({
    url: `private/${uid}/shelf/collaborative`,
    searchParams: { p: page },
    revalidate: oneDay * 3,
    tag: "collaborativeShelvesOfUser_uid_page",
    options: { uid, page },
  });

export const getShelvesAsInvitee = async (uid: string, page: number) =>
  await ppGetData<AggregatedResponse<MereShelf>>({
    url: `private/${uid}/shelf/invited`,
    searchParams: { p: page },
    revalidate: oneDay * 3,
    tag: "invitedShelvesOfUser_uid_page",
    options: { uid, page },
  });

export const getPostById = async (
  id: string
): Promise<GeneralGetReturn<FullPost>> =>
  await ppGetData({
    url: `post/${id}`,
    revalidate: oneDay,
    tag: "post_pid",
    options: { pid: id },
  });

export const getQuotesOfPost = async (id: string, page = 1, nsfw: boolean) =>
  await ppGetData<AggregatedResponse<MerePost>>({
    url: `post/${id}/quotes`,
    searchParams: { p: page, nsfw },
    revalidate: oneDay,
    tag: "quotedPosts_pid_page_nsfw",
    options: { pid: id, page, nsfw },
  });

export const getCommentsOnPost = async (
  id: string,
  page: number,
  filter = queryFilters.comments[0],
  nsfw: boolean,
) =>
  await ppGetData<AggregatedResponse<MereComment>>({
    url: `comment/post/${id}`,
    searchParams: { p: page, f: filter, nsfw },
    revalidate: oneDay,
    tag: "commentsOfPost_pid_filter_page_nsfw",
    options: { filter, pid: id, page, nsfw },
  });

export const getCommentById = async (id: string) =>
  await ppGetData<FullComment>({
    url: `comment/${id}`,
    revalidate: oneDay,
    tag: "comment_cid",
    options: { cid: id },
  });

export const checkLikeOnComment = async (cid: string, uid: string, cookies?: CookiesType) =>
  await ppGetData({
    url: `private/${uid}/comment/${cid}/like`,
    revalidate: oneDay * 2,
    tag: "like_cid_uid",
    options: { cid, uid },
    cookies,
  });

export const getRepliesOnComment = async (
  id: string,
  page: number,
  filter = queryFilters.comments[0],
  nsfw: boolean,
) =>
  await ppGetData<AggregatedResponse<MereComment>>({
    url: `comment/${id}/replies`,
    searchParams: { p: page, f: filter, nsfw },
    revalidate: oneDay,
    tag: "replies_cid_filter_page_nsfw",
    options: { cid: id, filter, page, nsfw },
  });

export const getThreadsForMedia = async (
  id: string,
  page: number,
  nsfw: boolean,
  filter = queryFilters.threads[0],
) =>
  await ppGetData<AggregatedResponse<MereThread>>({
    url: `thread/cinement/${id}`,
    searchParams: { p: page, f: filter, nsfw },
    revalidate: oneDay,
  });

export const getUserByUsername = async (username: string) =>
  await ppGetData<RequestedUser>({
    url: `user/${username}`,
    revalidate: oneDay * 2,
    tag: "user_username",
    options: { username },
  });

export const getFollowers = async (uid: string, page = 1, cookies?: CookiesType) =>
  await ppGetData<AggregatedResponse<MereUser>>({
    url: `private/${uid}/user/followers`,
    revalidate: oneDay * 2,
    tag: "followersOfUser_uid_page",
    options: { uid, page },
    cookies,
  });

export const getFollowing = async (uid: string, page = 1, cookies?: CookiesType) =>
  await ppGetData<AggregatedResponse<MereUser>>({
    url: `private/${uid}/user/following`,
    revalidate: oneDay * 2,
    tag: "followingOfUser_uid_page",
    options: { uid, page },
    cookies,
  });

export const getBlockedUsers = async (uid: string, page = 1, cookies?: CookiesType) =>
  await ppGetData<AggregatedResponse<MereUser>>({
    url: `private/${uid}/user/blocked`,
    revalidate: oneDay * 2,
    tag: "blockedByUser_uid_page",
    options: { uid, page },
    cookies,
  });

export const getCinement = async (ext_id: string, type: "movie" | "show"): Promise<FullCinementType | null> => {
  if (!ext_id) return null;

  const id = ext_id.split("-")[0];

  const item = await ppGetData<FullCinementType>({
    url: `cinement/${id}`,
    revalidate: oneDay * 2,
    tag: "cinement_extid",
    options: { extid: id },
  });

  if (item.success) return item.result;

  const media = await fetch(
    `https://testlalaapp.vercel.app/api/${type}?id=${ext_id}`,
    { next: { revalidate: oneDay * 2 } }
  ).then((r) => r.json());

  if (!media.status) return null;

  const { title, name, release_date, first_air_date, poster_path } =
    media.response;

  const data = {
    title: title ?? name,
    poster: poster_path || "",
    year: new Date(release_date ?? first_air_date).getFullYear(),
    media_type: type,
    tmdb_id: id,
  };

  const { result } = await axios
    .post(`${parloculaAppURL}/api/v1/cinement/${id}`, objectToFormData(data))
    .then((r) => r.data);

  return result;
};

export const getShelvesForCinement = async (id: string, uid: string, cookies?: CookiesType) =>
  await ppGetData<ShelvesForCinement>({
    url: `/private/${uid}/cinement/${id}`,
    tag: "shelvesForMedia_mid_uid",
    options: { mid: id, uid },
    revalidate: oneDay,
    cookies,
  });

export const getShelf = async (
  id: string,
  uid: string | undefined,
  key: string = 'none'
): Promise<GeneralGetReturn> => {
  const { success, errCode, result } = await ppGetData<FullShelf>({
    url: `private/${uid}/shelf/${id}`,
    searchParams: { k: key },
    revalidate: oneDay * 2,
    tag: "shelf_sid_key",
    options: { lid: id, key },
  });

  if (!success || !result) return { success, errCode, result };

  if (result.isPrivate) {
    if (!uid) return { success: false, errCode: "unauthenticated_access" };
    else if (
      !(
        result.user_id === uid ||
        result.shelfKey === key ||
        result.collaborators?.find((u) => u === uid)
      )
    )
      return { success: false, errCode: "unauthorized_access" };
  }
  return { success, result };
};

export const getShelfConnection = async (uid: string, sid: string, cookies?: CookiesType) =>
  await ppGetData<Required<CollaboratorModelType>>({
    url: `private/${uid}/shelf/${sid}/isCollaborator`,
    revalidate: oneDay * 3,
    tag: "isShelfCollaborator_uid_sid",
    options: { sid, uid },
    cookies,
  })

export const getCollaboratorsOfShelf = async (uid: string, sid: string, cookies: CookiesType) =>
  await ppGetData<ShelfCollaborators>({
    url: `private/${uid}/shelf/${sid}/collaborators`,
    cookies,
    revalidate: oneDay * 3,
    tag: "shelfCollaborators_sid",
    options: { sid },
  });

export const getItems = async (
  id: string,
  uid: string | undefined,
  page: number,
  filter = queryFilters.items[0],
  key = "none"
) =>
  await ppGetData<AggregatedResponse<ShelfItemType>>({
    url: `private/${uid}/item/${id}`,
    searchParams: { k: key, f: filter, p: page },
    revalidate: oneDay,
    tag: "items_sid_filter_page_key",
    options: { sid: id, filter, page, key },
  });

export const searchPosts = async (query: string, nsfw: boolean, page = 1) =>
  await ppGetData<AggregatedResponse<MerePost>>({
    url: "search/posts",
    searchParams: { q: query, nsfw, p: page },
  });

export const searchComments = async (query: string, nsfw: boolean, page = 1) =>
  await ppGetData<AggregatedResponse<MereComment>>({
    url: "search/comments",
    searchParams: { q: query, nsfw, p: page },
  });

export const searchThreads = async (query: string, nsfw: boolean, page = 1) =>
  await ppGetData<AggregatedResponse<MereThread>>({
    url: "search/threads",
    searchParams: { q: query, nsfw, p: page },
  });

export const searchUsers = async (query: string, page = 1) =>
  await ppGetData<AggregatedResponse<MereUser>>({
    url: "search/users",
    searchParams: { q: query, p: page }
  });

export const searchShelves = async (query: string, page = 1) =>
  await ppGetData<AggregatedResponse<MereShelf>>({
    url: "search/shelves",
    searchParams: { q: query, p: page }
  })

export const searchFollowers = async (q: string, uid: string, p = 1) =>
  await ppGetData<AggregatedResponse<MereUser>>({
    url: `private/${uid}/search/followers`,
    searchParams: { q, p }
  });

export const searchBlockedUsers = async (q: string, uid: string, p = 1) =>
  await ppGetData<AggregatedResponse<MereUser>>({
    url: `private/${uid}/search/blocked`,
    searchParams: { q, p }
  });

export const searchFollowing = async (q: string, uid: string, p = 1) =>
  await ppGetData<AggregatedResponse<MereUser>>({
    url: `private/${uid}/search/following`,
    searchParams: { q, p }
  });

export const searchBannedMembers = async (tid: string, uid: string, q: string, p = 1) =>
  await ppGetData<AggregatedResponse<MereUser>>({
    url: `private/${uid}/search/banned/${tid}`,
    searchParams: { q, p }
  });

export const checkIfItemSaved = async (
  id: string,
  uid: string,
  cookies?: CookiesType
) =>
  await ppGetData({
    url: `private/${uid}/bookmark/${id}`,
    revalidate: oneDay * 2,
    tag: "isSaved_uid_id",
    options: { uid, id },
    cookies,
  });

export const getSavedContent = async (
  uid: string,
  type: "comment" | "shelf" | "post",
  page = 1,
  cookies?: CookiesType
) =>
  await ppGetData<AggregatedResponse>({
    url: `private/${uid}/bookmark/${type}`,
    searchParams: { p: page },
    revalidate: oneDay * 2,
    tag: `saved-${type}s_uid_page`,
    options: { uid, page },
    cookies,
  });

export const checkUserConnection = async (
  uid: string,
  rid: string,
  cookies?: CookiesType
): Promise<GeneralGetReturn> =>
  await ppGetData({
    url: `private/${uid}/user/${rid}/follow`,
    revalidate: oneDay * 2,
    tag: "connection_rid_uid",
    options: { uid, rid },
    cookies,
  });

export const getNotificationsOfUser = async (
  uid: string,
  page: number,
  cookies?: CookiesType
) =>
  await ppGetData<AggregatedResponse<NotificationModelType>>({
    url: `private/${uid}/notification`,
    searchParams: { p: page },
    revalidate: oneDay,
    tag: "notifications_uid_page",
    options: { uid, page },
    cookies,
  });

export const getBannedMembers = async (tid: string, uid: string, p = 1, cookies?: CookiesType) =>
  await ppGetData<AggregatedResponse<MereUser>>({
    url: `private/${uid}/thread/${tid}/banned`,
    searchParams: { p },
    cookies,
  });

export const getManagers = async (tid: string, uid: string, cookies?: CookiesType) =>
  await ppGetData<ThreadModType>({
    url: `private/${uid}/thread/${tid}/managers`,
    tag: "threadManagers_tid",
    options: { tid },
    revalidate: oneDay * 3,
    cookies,
  });

export const getRooms = async (uid: string, page = 1, cookies?: CookiesType) =>
  await ppGetData<AggregatedResponse<MereRoomType>>({
    url: `private/${uid}/room`,
    searchParams: { p: page },
    cookies,
  });

export const getInvitedRooms = async (
  uid: string,
  page = 1,
  cookies?: CookiesType
) =>
  await ppGetData<AggregatedResponse<MereRoomType>>({
    url: `private/${uid}/room/invitation`,
    searchParams: { p: page },
    cookies,
  });

export const getRoomById = async (
  uid: string,
  rmid: string,
  cookies?: CookiesType
): Promise<GeneralGetReturn<FullRoomType>> =>
  await ppGetData({
    url: `private/${uid}/room/${rmid}`,
    cookies,
  });

export const getParticipantsOfRoom = async (
  uid: string,
  rmid: string,
  page = 1,
  cookies?: CookiesType
) =>
  await ppGetData<AggregatedResponse<MereUser>>({
    url: `private/${uid}/room/${rmid}/participant`,
    searchParams: { p: page },
    cookies,
  });

export const getRoomByUserId = async (
  uid: string,
  ruid: string,
  cookies?: CookiesType
) =>
  await ppGetData<FullRoomType>({
    url: `private/${uid}/room/user/${ruid}`,
    cookies,
  });

export const getMessages = async (
  uid: string,
  rmid: string,
  page = 1,
  cookies?: CookiesType
): Promise<GeneralMultipleReturn<MereMessage>> =>
  await ppGetData({
    url: `private/${uid}/room/${rmid}/message`,
    searchParams: { p: page },
    cookies,
  });

export const getUserMeta = async (uid: string) =>
  await ppGetData<MereUser>({ url: `user/meta/${uid}` });

export const getReportsOnContent = (content_id: string) =>
  ppGetData<{ reports: ReportsType[] }>({
    url: `report/${content_id}`,
    revalidate: oneDay,
    tag: "reports_cnid",
    options: { cnid: content_id }
  });

export const checkIfReportExists = (cnid: string, uid: string, type: "post" | "comment" | "thread" | "user", cookies?: CookiesType) =>
  ppGetData<ReportModelType>({
    url: `private/${uid}/report/${cnid}`,
    searchParams: { t: type },
    cookies,
    revalidate: oneDay * 3
  })

export const getReportsOnThread = (tid: string, uid: string) =>
  ppGetData<{ reports: ReportsType[] }>({
    url: `private/${uid}/report/${tid}/thread`
  });

export const getReportedContents = (tid: string, uid: string, type: "post" | "comment", page = 1) =>
  ppGetData<AggregatedResponse<ReportsType>>({
    url: `private/${uid}/report/${tid}/${type}s`,
    searchParams: { p: page },
  });

export const searchRooms = async (uid: string, query: string, page = 1) =>
  await ppGetData<AggregatedResponse<SearchedRoom>>({
    url: `private/${uid}"search/rooms" `,
    searchParams: { q: query, p: page },
  });

export const searchNonBlockedUsers = async (uid: string, query: string, page = 1): Promise<GeneralMultipleReturn<MereUser>> =>
  await ppGetData({
    url: `private/${uid}/search/users`,
    searchParams: { q: query, p: page }
  });