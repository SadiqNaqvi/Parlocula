import { getUserFromToken } from "@lib/auth/utils";
import { connectPPDB } from "@lib/database";
import {
  formDataToObject,
  getCacheTags,
  getLocalUrl,
  getRevalidateTags,
  objectToFormData,
} from "@lib/utils";
import { UserMetaData } from "@store/user";
import {
  Frame,
  FullList,
  FullMediaItemType,
  FullPost,
  FullRoomType,
  GeneralGetReturn,
  GeneralMultipleReturn,
  MereComment,
  MereMessage,
  MereThread,
  MereUser,
  ReportsType,
  SearchedRoom,
  Thread,
  ThreadModType,
  User
} from "@type/internal";
import {
  AvailableCacheTags,
  AvailableRevalidateTags,
  CookiesType,
  HandlerResponse,
  HandlerWrapperProps,
  PPGetDataProps,
  PrecheckProps,
  PrecheckResponse
} from "@type/other";
import { FrameDataSchemaType } from "@type/schemas";
import axios from "axios";
import { ClientSession, startSession } from "mongoose";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { oneDay, queryFilters } from "../constants";
import { deleteMultipleMedia, mediaUploader } from "./server";

// HELPER FUNCTIONS

type HandlerReturn<T> = Promise<NextResponse<T>>

export const getRequest = (
  handler: (
    req: NextRequest,
    params: { id: string; cuid: string;[key: string]: string }
  ) => Promise<GeneralGetReturn>
) => {
  return async function (req: NextRequest, { params }: { params?: any }): HandlerReturn<GeneralGetReturn> {
    try {
      const isDbConnected = await connectPPDB();
      if (!isDbConnected)
        return NextResponse.json(
          {
            success: false,
            errCode: "database_connection_fail",
          },
          { status: 500 }
        );

      const data = await handler(req, params);
      return NextResponse.json(data, { status: data.success ? 200 : 500 });
    } catch (err) {
      console.error(`Error occurred at path ${req.nextUrl.pathname}:`, err);
      return NextResponse.json(
        {
          errCode: "uncaught_error",
          success: false,
        },
        { status: 500 }
      );
    }
  };
};

export const ppGetData = async <
  T extends any,
  K extends AvailableCacheTags = any,
>({
  url,
  revalidate,
  tag,
  options,
  cookies,
}: PPGetDataProps<K>): Promise<GeneralGetReturn<T>> => {
  const cacheTags = tag && options ? getCacheTags(tag, options) : undefined;
  const jar =
    cookies
      ?.getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ") ?? "undefined";
  try {
    return await fetch(
      `${getLocalUrl()}/api/v1/${url}`,
      {
        next: { revalidate: revalidate ?? 0, tags: cacheTags },
        headers: {
          Cookie: jar,
        },
      }
    )
      .then((res) => res.json());
  } catch (err: any) {
    console.error(`Error occured at path ${url}`, err.message);
    return {
      success: false,
      errCode: "unstable_internet",
    };
  }
};

const uploadFiles = async ({
  files,
  filesData,
}: {
  files: File[];
  filesData: FrameDataSchemaType[];
}) => {
  if (!filesData?.length || !files?.length) return [];
  const response = await mediaUploader(files);

  if (!response.success) throw new Error("File upload fail", { cause: response.error });

  const results = response.result;

  return filesData
    .map(({ isExternal, path, type, shouldUpload }) => {
      if (!shouldUpload) return { path, type, isExternal };
      const result = results.shift();
      if (result) return { path: result.url, type, isExternal };
      else return false;
    })
    .filter(Boolean) as Frame[];
};

const deleteFiles = async (files: Frame[]) => {
  if (!files.length) return;
  const ids = files.filter((file) => !file.path.includes("https"));
  await deleteMultipleMedia(ids.map(({ path, type }) => ({ path, type })));
};

export const postRequest = <
  T extends any,
  K extends AvailableRevalidateTags = any,
>({
  handler,
  preCheck,
  schema,
}: {
  handler: (args: HandlerWrapperProps<T>) => Promise<HandlerResponse<K>>;
  preCheck?: (
    arg: PrecheckProps<T>
  ) => PrecheckResponse | Promise<PrecheckResponse>;
  schema?: ZodSchema;
}) => {
  return async function (req: NextRequest, { params }: { params: any }) {
    const payload = await getUserFromToken(req.cookies);

    if (
      !(
        req.url.includes("user/register") ||
        req.url.includes("user/login") ||
        req.url.includes("api/v1/media")
      ) &&
      !payload
    )
      return NextResponse.json(
        {
          success: false,
          errCode: "unauthenticated_access",
          result: null,
        },
        { status: 500 }
      );

    const user_id = payload?.user_id || "";
    const username = payload?.username || "";

    const formData = formDataToObject(await req.formData());
    let dataToPost: T | null = null;
    if (schema) {
      const { success, error, data } = schema.safeParse(formData);
      if (!success)
        return NextResponse.json(
          {
            result: null,
            success: false,
            formError: error.errors,
            errCode: "form_error",
          },
          { status: 500 }
        );
      dataToPost = data;
    }

    let frames: Frame[] = [];
    let revalidateTags: string[] = [];
    let session: ClientSession | null = null;

    try {
      const isDbConnected = await connectPPDB();
      if (!isDbConnected)
        return NextResponse.json(
          {
            result: null,
            success: false,
            errCode: "database_connection_fail",
          },
          { status: 500 }
        );

      if (preCheck) {
        const { errCode, success } = await preCheck({
          req,
          params,
          user_id,
          username,
          data: dataToPost ?? (formData as T),
        });
        if (!success)
          return NextResponse.json(
            { result: null, success, errCode },
            { status: 500 }
          );
      }

      session = await startSession();

      const { files, filesData, ...rest } = formData;
      frames =
        filesData && filesData.length
          ? await uploadFiles({ files, filesData })
          : [];

      session.startTransaction();
      const { available, errCode, options, result, success, revalidateQueue } =
        await handler({
          data: dataToPost ?? (rest as T),
          frames,
          user_id: user_id as string,
          username: username as string,
          session,
          req,
          params,
        });

      if (!success) {
        await deleteFiles(frames);
        await session.abortTransaction().catch(console.error);
      } else {
        if (revalidateQueue && revalidateQueue.length) {
          revalidateTags = revalidateQueue;
        } else if (available && options) {
          revalidateTags = getRevalidateTags(available, options);
        }
        await session.commitTransaction().catch(console.error);
      }

      return NextResponse.json(
        { result, success, errCode },
        { status: success ? 200 : 500 }
      );
    } catch (err: any) {
      await deleteFiles(frames);
      await session?.abortTransaction().catch(console.error);
      console.error(
        `Error occurred at path ${req.nextUrl.pathname}:`,
        err.message
      );
      return NextResponse.json(
        {
          result: null,
          success: false,
          errCode: "unknown_error",
        },
        { status: 500 }
      );
    } finally {
      session?.endSession();
      revalidateTags.forEach((tag) => revalidateTag(tag));
    }
  };
};

export const deleteRequest = <K extends AvailableRevalidateTags = any>(
  handler: (
    args: Omit<HandlerWrapperProps, "frames" | "data">
  ) => Promise<Omit<HandlerResponse<K> & { files?: Frame[] }, "result">>,
  precheck?: (req: NextRequest, params: any) => PrecheckResponse
) => {
  return async (req: NextRequest, { params }: any) => {
    const payload = await getUserFromToken(req.cookies);

    if (!payload)
      return NextResponse.json({ success: false, errCode: "unauthenticated_access" });

    const user_id = payload.user_id;
    const username = payload.username;
    let revalidateTags: string[] = [];
    let session: ClientSession | null = null;

    try {
      const isDbConnected = await connectPPDB();
      if (!isDbConnected)
        return NextResponse.json({ success: false, errCode: "database_connection_fail" });

      if (precheck) {
        const { success, errCode } = await precheck(req, params);
        if (!success) return NextResponse.json({ success, errCode });
      }

      session = await startSession();

      session.startTransaction();
      const { errCode, success, available, options, files, revalidateQueue } =
        await handler({
          req,
          user_id,
          params,
          username,
          session,
        });

      if (success) {
        files && (await deleteFiles(files));
        await session.commitTransaction();
        if (revalidateQueue && revalidateQueue.length)
          revalidateTags = revalidateQueue;
        else if (available && options)
          revalidateTags = getRevalidateTags(available, options);
      } else await session.abortTransaction().catch(console.error);

      return NextResponse.json({ success, errCode });
    } catch (err) {
      await session?.abortTransaction().catch(console.error);
      console.error("Error occured while deleting resource", err);
      return NextResponse.json({
        success: false,
        errCode: "unknown_error",
      });
    } finally {
      session?.endSession();
      revalidateTags.forEach((tag) => revalidateTag(tag));
    }
  };
};

export const updateRequest = <
  T extends any,
  K extends AvailableRevalidateTags = any,
>({
  handler,
  preCheck,
  schema,
}: {
  handler: (arg: HandlerWrapperProps<T>) => Promise<HandlerResponse<K>>;
  schema?: ZodSchema;
  preCheck?: (
    arg: PrecheckProps<T>
  ) => PrecheckResponse | Promise<PrecheckResponse>;
}) => {
  return async (req: NextRequest, { params }: any) => {
    // Checking if there is a current user and taking it's user_id and username
    const payload = await getUserFromToken(req.cookies);

    if (!payload)
      return NextResponse.json(
        { success: false, errCode: "unauthenticated_access" },
        { status: 500 }
      );

    const user_id = payload.user_id;
    const username = payload.username;

    const formData = formDataToObject(await req.formData());
    let dataToUpdate: T | null = null;
    // Validating the data if a schema is provided
    if (schema) {
      const { success, error, data } = schema.safeParse(formData);
      if (!success)
        return NextResponse.json(
          {
            success: false,
            formError: error.errors,
            errCode: "form_error",
          },
          { status: 500 }
        );
      dataToUpdate = data;
    }

    let revalidateTags: string[] = [];
    let frames: Frame[] = [];
    let session: ClientSession | null = null;
    try {
      const isDbConnected = await connectPPDB();
      if (!isDbConnected)
        return NextResponse.json({
          result: null,
          success: false,
          errCode: "database_connection_fail",
        });

      session = await startSession();

      // Some pre-checking eg: if the user is authorized to do this specific thing or not
      if (preCheck) {
        const { errCode, success } = await preCheck({
          data: dataToUpdate ?? (formData as T),
          params,
          req,
          user_id,
          username,
        });
        if (!success)
          return NextResponse.json({ success, errCode }, { status: 500 });
      }

      const { files, filesData, filesToRemove, ...rest } = formData;
      frames = filesData?.length ? await uploadFiles({ files, filesData }) : [];

      session.startTransaction();
      const { available, errCode, options, result, success, revalidateQueue } =
        await handler({
          data: dataToUpdate ?? (rest as T),
          frames,
          user_id: user_id as string,
          username: username as string,
          session,
          req,
          params,
        });

      if (success) {
        await deleteMultipleMedia(filesToRemove);

        if (revalidateQueue && revalidateQueue.length)
          revalidateTags = revalidateQueue;
        else if (available && options)
          revalidateTags = getRevalidateTags(available, options);

        await session.commitTransaction();
      } else {
        await deleteFiles(frames);
        await session.abortTransaction().catch(console.error);
      }

      return NextResponse.json(
        { result, success, errCode },
        { status: success ? 200 : 500 }
      );
    } catch (err: any) {
      await session?.abortTransaction().catch(console.error);
      console.error(
        `Error occured at path ${req.nextUrl.pathname} while updating data`,
        err.message
      );
      await deleteFiles(frames);
      return NextResponse.json(
        {
          result: null,
          success: false,
          errCode: "unknown_error",
        },
        { status: 500 }
      );
    } finally {
      session?.endSession();
      revalidateTags.forEach((tag) => revalidateTag(tag));
    }
  };
};

// FUNCTIONS TO FETCH DATA BOTH ON SERVER AND CLIENT SIDE

export const getCurrentUser = async (id: string, cookies?: CookiesType) =>
  await ppGetData({
    url: `private/${id}/user`,
    revalidate: oneDay * 2,
    tag: "currentUser_uid",
    options: { uid: id },
    cookies,
  });

export const isUsernameAvailable = async (
  username: string
): Promise<GeneralGetReturn> => {
  if (!username) return { success: true, result: false };
  const response = await ppGetData({
    url: `user/isUsernameAvailable?username=${username}`,
    revalidate: oneDay * 2,
    tag: "usernameAvailability_username",
    options: { username },
  });

  if (!response.success && response.errCode === "resource_not_found")
    return { success: true, result: true };
  else return response;
};

export const checkIfUserExist = async (email: string) =>
  await ppGetData({
    url: `user/ifUserExist?email=${email}`,
    revalidate: oneDay * 2,
    tag: "userExistence_email",
    options: { email },
  });


export const getThreadById = async (
  id: string
): Promise<GeneralGetReturn<Thread>> =>
  await ppGetData({
    url: `thread/${id}`,
    revalidate: oneDay * 2,
    tag: "thread_tid",
    options: { tid: id },
  });

export const getThreads = async (
  page: number,
  filter: string
): Promise<GeneralMultipleReturn<MereThread>> =>
  await ppGetData({
    url: `thread?p=${page}&f=${filter || queryFilters.threads[0]}`,
    revalidate: oneDay,
    tag: "filteredThreads_filter_page",
    options: {
      filter: filter || queryFilters.threads[0],
      page: page.toString(),
    },
  });

export const getMembers = async (tid: string, page: string) =>
  await ppGetData({
    url: `thread/${tid}/members?p=${page}`,
    revalidate: oneDay,
    tag: "membersOfThread_tid_page",
    options: { page, tid },
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
  await ppGetData({
    url: `search/members/${tid}?q=${query}&p=${page}`,
  });

export const threadsByUser = async (
  uid: string,
  page = 1,
  cookies?: CookiesType
) =>
  await ppGetData({
    url: `private/${uid}/thread/user?p=${page}`,
    revalidate: oneDay * 2,
    tag: "threadsByUser_uid_page",
    options: { uid, page: page.toString() },
    cookies,
  });

export const getPostsOfThread = async (
  tid: string,
  page: number,
  filter: string,
  tag?: string
): Promise<GeneralMultipleReturn> =>
  await ppGetData({
    url: `post/thread/${tid}?p=${page}&f=${filter || "latest"}${tag ? `&t=${tag}` : ""
      }`,
    revalidate: oneDay,
    tag: "postsOfThread_filter_tid_page_tag",
    options: {
      filter: filter || queryFilters.posts[0],
      tid,
      page: page.toString(),
      tag: tag || "",
    },
  });

export const getPostsOfUser = async (
  username: string,
  page: number,
  filter: string = "latest"
) =>
  await ppGetData({
    url: `post/user/${username}?p=${page}&f=${filter || "latest"}`,
    revalidate: oneDay * 3,
    tag: "postsOfUser_username_filter_page",
    options: {
      filter: filter || queryFilters.posts[0],
      username,
      page: page.toString(),
    },
  });

export const getReactionOnPost = async (
  pid: string,
  uid: string,
  cookies?: CookiesType
): Promise<GeneralGetReturn> => {
  if (!uid) return { success: true, result: null };
  const response = await ppGetData({
    url: `private/${uid}/post/${pid}/reaction`,
    revalidate: oneDay * 2,
    tag: "reaction_pid_uid",
    options: { pid, uid },
    cookies,
  });
  return response;
};

export const getCommentsOfUser = async (
  username: string,
  page: number,
  filter: string
) =>
  await ppGetData({
    url: `comment/user/${username}?p=${page}&f=${filter || "loved"}`,
    revalidate: oneDay * 3,
    tag: "postsOfUser_username_filter_page",
    options: { filter: filter || "loved", username, page: page.toString() },
  });

export const getListsOfUser = async (
  username: string,
  page: number,
  filter: string
) =>
  await ppGetData({
    url: `lists/${username}?p=${page}&f=${filter || "recently_added"}`,
    revalidate: oneDay * 3,
    tag: "listsOfUser_filter_username_page",
    options: {
      filter: filter || "recently_added",
      username,
      page: page.toString(),
    },
  });

export const getPrivateListsOfUser = async (
  uid: string,
  page: number,
  filter: string
) =>
  await ppGetData({
    url: `private/${uid}/list?p=${page}&f=${filter || "recently_added"}`,
    revalidate: oneDay * 3,
    tag: "privateListsOfUser_filter_uid_page",
    options: { filter: filter || "recently_added", uid, page: page.toString() },
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

export const getReposts = async (id: string, page: number) =>
  await ppGetData({
    url: `post/${id}/reposts?p=${page || 1}`,
    revalidate: oneDay,
    tag: "reposts_pid_page",
    options: { pid: id, page: page.toString() },
  });

export const getCommentsOnPost = async ({
  id,
  page,
  filter,
}: {
  id: string;
  page: number;
  filter: string;
}) =>
  await ppGetData({
    url: `comment/post/${id}?p=${page || 1}&f=${filter || "loved"}`,
    revalidate: oneDay,
    tag: "filteredComments_pid_filter_page",
    options: {
      filter: filter || queryFilters.comments[0],
      pid: id,
      page: page.toString(),
    },
  });

export const getCommentById = async (id: string) =>
  await ppGetData<MereComment>({
    url: `comment/${id}`,
    revalidate: oneDay,
    tag: "comment_cid",
    options: { cid: id },
  });

export const getVoteOnComment = async (
  cid: string,
  uid: string,
  cookies?: CookiesType
): Promise<GeneralGetReturn> => {
  if (!uid) return { success: false, errCode: "unauthenticated_access" };
  const response = await ppGetData({
    url: `private/${uid}/comment/${cid}/vote`,
    revalidate: oneDay * 2,
    tag: "vote_cid_uid",
    options: { cid, uid },
    cookies,
  });
  return response;
};

export const getRepliesOnComment = async (
  id: string,
  page: number,
  filter: string
) =>
  await ppGetData({
    url: `comment/${id}/replies?p=${page ?? 1}${filter ? `&f=${filter}` : ""}`,
    revalidate: oneDay,
    tag: "replies_cid_filter_page",
    options: { cid: id, filter, page: page.toString() },
  });

export const getThreadsForMedia = async (
  id: string,
  page: string,
  filter: string
) =>
  await ppGetData({
    url: `thread/media/${id}?p=${page}f=${filter || "popular"}`,
    revalidate: oneDay,
  });

export const getUserByUsername = async (username: string) =>
  await ppGetData<User>({
    url: `user/${username}`,
    revalidate: oneDay * 2,
    tag: "user_username",
    options: { username },
  });

export const getFollowers = async (
  uid: string,
  page = 1,
  cookies?: CookiesType
) =>
  await ppGetData({
    url: `private/${uid}/user/followers`,
    revalidate: oneDay * 2,
    tag: "followersOfUser_uid_page",
    options: { uid, page: page.toString() },
    cookies,
  });

export const getFollowing = async (
  uid: string,
  page = 1,
  cookies?: CookiesType
) =>
  await ppGetData({
    url: `private/${uid}/user/following`,
    revalidate: oneDay * 2,
    tag: "followingOfUser_uid_page",
    options: { uid, page: page.toString() },
    cookies,
  });

export const getMediaItem = async (
  tmdbid: string,
  type: "movie" | "show"
): Promise<FullMediaItemType | null> => {
  if (!tmdbid) return null;
  const id = tmdbid.split("-")[0];
  const item = await ppGetData<FullMediaItemType>({
    url: `media/${id}`,
    revalidate: oneDay * 2,
    tag: "media_tmdbid",
    options: { tmdbid: id },
  });

  if (item.success) return item.result;

  const media = await fetch(
    `https://testlalaapp.vercel.app/api/${type}?id=${tmdbid}`,
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
    .post(`${getLocalUrl()}/api/v1/media/${id}`, objectToFormData(data))
    .then((r) => r.data);

  return result;
};

export const getListsForMedia = async (
  id: string,
  uid: string,
  cookies?: CookiesType
) =>
  await ppGetData({
    url: `/private/${uid}/media/${id}`,
    tag: "listsForMedia_mid_uid",
    options: { mid: id, uid },
    revalidate: oneDay,
    cookies,
  });

export const getList = async (
  id: string,
  uid: string,
  key?: string
): Promise<GeneralGetReturn> => {
  if (!id) return { success: false, errCode: "resource_not_found" };

  const { success, errCode, result } = await ppGetData<FullList>({
    url: `private/${uid}/list/${id}${key ? `k=${key}` : ""}`,
    revalidate: oneDay * 2,
    tag: "list_lid_key",
    options: { lid: id, key: key ?? "none" },
  });

  if (!success) return { success, errCode };
  else if (!result) return { success, result };

  if (result.isPrivate) {
    if (!uid) return { success: false, errCode: "unauthenticated_access" };
    else if (
      !(
        result.user_id === uid ||
        result.listKey === key ||
        result.collaborators?.find((u) => u === uid)
      )
    )
      return { success: false, errCode: "unauthorized_access" };
  }
  return { success, result };
};

export const getCollaboratorsOfList = async (
  uid: string | undefined,
  lid: string,
  cookies: CookiesType
): Promise<GeneralGetReturn> => {
  if (!uid) return { success: false, errCode: "unauthenticated_access" };
  return await ppGetData({
    url: `private/${uid}/list/${lid}/collaborators`,
    cookies,
    revalidate: oneDay * 3,
    tag: "listCollaborators_lid",
    options: { lid },
  });
};

export const getItems = async (
  id: string,
  uid: string | undefined,
  page: number,
  filter: string,
  key?: string
): Promise<GeneralGetReturn> => {
  if (!id) return { success: false, errCode: "resource_not_found" };

  return await ppGetData({
    url: `private/${uid}/item/${id}?p=${page}&f=${filter}${key ? `&k=${key}` : ""}`,
    revalidate: oneDay,
    tag: "items_lid_filter_page_key",
    options: { lid: id, filter, page: String(page), key: key ?? "none" },
  });
};

export const searchPosts = async (query: string, nsfw: boolean, page = 1) =>
  await ppGetData({
    url: `search/posts?q=${query}${nsfw ? "&nsfw=true" : ""}&p=${page}`,
    revalidate: oneDay,
  });

export const searchComments = async (query: string, nsfw: boolean, page = 1) =>
  await ppGetData({
    url: `search/comments?q=${query}${nsfw ? "&nsfw=true" : ""}&p=${page}`,
    revalidate: oneDay,
  });

export const searchThreads = async (query: string, nsfw: boolean, page = 1) =>
  await ppGetData({
    url: `search/threads?q=${query}${nsfw ? "&nsfw=true" : ""}&p=${page}`,
  });

export const searchUsers = async (query: string, page = 1) => {
  const { success, result } = await ppGetData({
    url: `search/users?q=${query}&p=${page}`,
  });
  if (success) return result;
};

export const searchLists = async (query: string, page = 1) => {
  const { success, result } = await ppGetData({
    url: `search/lists?q=${query}&p=${page}`,
  });
  if (success) return result;
};

export const searchFollowers = async (q: string, uid: string, p = 1) =>
  await ppGetData({
    url: `private/${uid}/search/followers?q=${q}&p=${p}`,
  });

export const searchFollowing = async (q: string, uid: string, p = 1) =>
  await ppGetData({
    url: `private/${uid}/search/following?q=${q}&p=${p}`,
  });

export const searchBannedMembers = async (
  tid: string,
  uid: string,
  q: string,
  p = 1
) =>
  await ppGetData({
    url: `private/${uid}/search/banned/${tid}?q=${q}&p=${p}`,
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
  type: "comment" | "list" | "post",
  page = 1,
  cookies?: CookiesType
) =>
  await ppGetData({
    url: `private/${uid}/bookmark/${type}?p=${page}`,
    revalidate: oneDay * 2,
    tag: `saved-${type}s_uid_page`,
    options: { uid, page: page.toString() },
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
  await ppGetData({
    url: `private/${uid}/notifications?p=${page}`,
    revalidate: oneDay,
    tag: "notifications_uid_page",
    options: { uid, page: page.toString() },
    cookies,
  });

export const getBannedMembers = async (tid: string, uid: string, p = 1) =>
  await ppGetData({
    url: `private/${uid}/thread/${tid}/banned?p=${p}`,
  });

export const getManagers = async (
  tid: string,
  uid: string,
  cookies: CookiesType
): Promise<GeneralGetReturn> => {
  const { success, result, errCode } = await ppGetData<ThreadModType[]>({
    url: `private/${uid}/thread/${tid}/managers`,
    tag: "threadManagers_tid",
    options: { tid },
    revalidate: oneDay * 3,
    cookies,
  });

  if (!success) return { success, errCode };
  else if (result.find((u) => u.user_id === uid && u.role === "moderator"))
    return { success, result };
  else return { success: false, errCode: "unauthorized_access" };
};

export const getRooms = async (uid: string, page = 1, cookies?: CookiesType) =>
  await ppGetData({
    url: `private/${uid}/room?p=${page}`,
    cookies,
  });

export const getInvitedRooms = async (
  uid: string,
  page = 1,
  cookies?: CookiesType
) =>
  await ppGetData({
    url: `private/${uid}/room/invitation?p=${page}`,
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

export const getRoomByUserId = async (
  uid: string,
  ruid: string,
  cookies?: CookiesType
) =>
  await ppGetData({
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
    url: `private/${uid}/room/${rmid}/message?p=${page}`,
    cookies,
  });

export const getUserMeta = async (uid: string) =>
  await ppGetData<UserMetaData>({ url: `user/meta/${uid}` });

export const getReportsOnContent = (content_id: string) => {
  return ppGetData({
    url: `report/${content_id}`,
    revalidate: oneDay,
    tag: "reports_cnid",
    options: { cnid: content_id }
  });
}

export const getReportsOnThread = (tid: string, uid: string) =>
  ppGetData<ReportsType>({ url: `private/${uid}/report/${tid}` });

export const getReportedContents = (tid: string, uid: string, type: "post" | "comment", page = 1) =>
  ppGetData<ReportsType>({ url: `private/${uid}/report/${tid}/${type}s?p=${page}` });

export const searchRooms = async (uid: string, query: string, page = 1) =>
  await ppGetData<GeneralMultipleReturn<SearchedRoom>>({ url: `private/${uid}/room/search?q=${query}&p=${page}` })


export const searchUsersForGroup = async (uid: string, query: string, page = 1) =>
  await ppGetData({ url: `private/${uid}/room/search/users?q=${query}&p=${page}` }) as GeneralMultipleReturn<MereUser>

