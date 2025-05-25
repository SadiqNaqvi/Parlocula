import { getUserFromToken } from "@lib/auth/utils";
import { connectPPDB } from "@lib/database";
import {
  formDataToObject,
  getCacheTags,
  getLocalUrl,
  objectToFormData,
} from "@lib/utils";
import {
  Frame,
  FullMediaItemType,
  FullPost,
  GeneralGetReturn,
  GeneralMultipleReturn,
  MereThread,
  Thread,
} from "@type/internal";
import {
  AvailableCacheTags,
  AvailableRevalidateTags,
  DeleteResponseWithCacheOptions,
  PostResponseWithCacheOptions,
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

export const getRequest = (
  handler: (req: any, params?: any) => Promise<GeneralGetReturn>
) => {
  return async function (req: NextRequest, { params }: { params?: any }) {
    try {
      const isDbConnected = await connectPPDB();
      if (!isDbConnected)
        return NextResponse.json(
          {
            success: false,
            errCode: "pp101",
          },
          { status: 500 }
        );

      const data = await handler(req, params);
      return NextResponse.json(data, { status: data.success ? 200 : 500 });
    } catch (err) {
      console.error(`Error occurred at path ${req.nextUrl.pathname}:`, err);
      return NextResponse.json(
        {
          errCode: "pp100",
          success: false,
        },
        { status: 500 }
      );
    }
  };
};

export const ppGetData = async ({
  url,
  revalidate,
  tag,
  options,
}: {
  url: string;
  revalidate: number;
  tag?: AvailableCacheTags;
  options: any;
}): Promise<GeneralGetReturn> => {
  const cacheTags =
    tag && getCacheTags({ type: "cache", available: tag, options });
  try {
    return await fetch(`${getLocalUrl()}/api/v1/${url}`, {
      next: { revalidate, tags: cacheTags },
    }).then((res) => res.json());
  } catch (err: any) {
    console.error(`Error occured at path ${url}`, err.message);
    return {
      success: false,
      errCode: "200",
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
  if (!filesData.length) return [];
  const promises =
    files &&
    files.map(async (file) => {
      const [type, extension] = file.type.split("/");
      const resp = await mediaUploader(file, {
        format: extension,
        resource_type: type as "image" | "video",
      });
      return resp.success ? resp.result.public_id : null;
    });

  const results = await Promise.all(promises);

  return filesData
    .map(({ isExternal, path, type, shouldUpload }) => {
      if (!shouldUpload) return { path, type, isExternal };
      const url = results.shift();
      if (url) return { path: url, type, isExternal };
      else return false;
    })
    .filter(Boolean) as Frame[];
};

const deleteFiles = async (files: Frame[]) => {
  if (!files.length) return;
  const ids = files.filter((file) => !file.path.includes("https"));
  await deleteMultipleMedia(ids.map(({ path, type }) => ({ path, type })));
};

type postReqProps = {
  data: any;
  frames: Frame[];
  user_id: string;
  username: string;
  session: ClientSession;
  req: NextRequest;
  params: { id: string; cuid: string };
};
export type Precheck = Omit<GeneralGetReturn, "result">;
export type cacheOptions = {
  options: any;
  available: AvailableRevalidateTags;
};

export const postRequest = ({
  handler,
  preCheck,
  schema,
}: {
  handler: (args: postReqProps) => Promise<PostResponseWithCacheOptions>;
  preCheck?: (
    arg: Omit<postReqProps, "frames" | "session">
  ) => Precheck | Promise<Precheck>;
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
          errCode: "pp202",
          result: null,
        },
        { status: 500 }
      );

    const user_id = payload?.user_id || "";
    const username = payload?.username || "";

    const formData = formDataToObject(await req.formData());

    if (schema) {
      const { success, error } = schema.safeParse(formData);
      if (!success)
        return NextResponse.json(
          {
            result: null,
            success: false,
            formError: error.errors,
            errCode: "pp203",
          },
          { status: 500 }
        );
    }

    let frames: Frame[] = [];
    let tagOptions: cacheOptions | null = null;
    let session: ClientSession | null = null;

    try {
      const isDbConnected = await connectPPDB();
      if (!isDbConnected)
        return NextResponse.json(
          {
            result: null,
            success: false,
            errCode: "pp101",
          },
          { status: 500 }
        );

      session = await startSession();

      if (preCheck) {
        const { errCode, success } = await preCheck({
          req,
          params,
          user_id,
          username,
          data: formData,
        });
        if (!success)
          return NextResponse.json(
            { result: null, success, errCode },
            { status: 500 }
          );
      }

      const { files, filesData, ...data } = formData;
      frames =
        filesData && filesData.length
          ? await uploadFiles({ files, filesData })
          : [];

      session.startTransaction();
      const { available, errCode, options, result, success } = await handler({
        data,
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
        tagOptions = { available, options };
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
          errCode: "pp100",
        },
        { status: 500 }
      );
    } finally {
      session?.endSession();
      if (tagOptions) {
        const { available, options } = tagOptions;
        getCacheTags({ type: "revalidate", available, options }).forEach(
          (tag) => revalidateTag(tag)
        );
      }
    }
  };
};

export const deleteRequest = (
  handler: (
    args: Omit<postReqProps, "frames" | "data">
  ) => Promise<DeleteResponseWithCacheOptions>,
  precheck?: (req: NextRequest, params: any) => Precheck
) => {
  return async (req: NextRequest, { params }: any) => {
    const payload = await getUserFromToken(req.cookies);

    if (!payload)
      return NextResponse.json({ success: false, errCode: "pp202" });

    const user_id = payload.user_id;
    const username = payload.username;
    let tagOptions: cacheOptions | null = null;

    let session: ClientSession | null = null;

    try {
      const isDbConnected = await connectPPDB();
      if (!isDbConnected)
        return NextResponse.json({ success: false, errCode: "pp101" });

      if (precheck) {
        const { success, errCode } = await precheck(req, params);
        if (!success) return NextResponse.json({ success, errCode });
      }

      session = await startSession();

      session.startTransaction();
      const { errCode, success, available, options, files } = await handler({
        req,
        user_id,
        params,
        username,
        session,
      });

      if (success) {
        tagOptions = { available, options };
        await deleteFiles(files);
        await session.commitTransaction();
      } else await session.abortTransaction().catch(console.error);

      return NextResponse.json({ success, errCode });
    } catch (err) {
      await session?.abortTransaction().catch(console.error);
      console.error("Error occured while deleting resource", err);
      return NextResponse.json({
        success: false,
        errCode: "pp100",
      });
    } finally {
      session?.endSession();
      if (tagOptions) {
        const { available, options } = tagOptions;
        getCacheTags({ type: "revalidate", available, options }).forEach(
          (tag) => {
            revalidateTag(tag);
          }
        );
      }
    }
  };
};

export const updateRequest = ({
  handler,
  preCheck,
  schema,
}: {
  handler: (arg: postReqProps) => Promise<PostResponseWithCacheOptions>;
  schema?: ZodSchema;
  preCheck?: (
    arg: Omit<postReqProps, "frames" | "session">
  ) => Precheck | Promise<Precheck>;
}) => {
  return async (req: NextRequest, { params }: any) => {
    const payload = await getUserFromToken(req.cookies);

    if (!payload)
      return NextResponse.json({ success: false, errCode: "pp202" });

    const user_id = payload.user_id;
    const username = payload.username;

    const formData = formDataToObject(await req.formData());
    if (schema) {
      const { success, error } = schema.safeParse(formData);
      if (!success)
        return NextResponse.json({
          result: null,
          success: false,
          formError: error.errors,
          errCode: "pp203",
        });
    }

    let tagOptions: cacheOptions | null = null;
    let frames: Frame[] = [];
    let session: ClientSession | null = null;
    try {
      const isDbConnected = await connectPPDB();
      if (!isDbConnected)
        return NextResponse.json({
          result: null,
          success: false,
          errCode: "pp101",
        });

      session = await startSession();

      if (preCheck) {
        const { errCode, success } = await preCheck({
          data: formData,
          params,
          req,
          user_id,
          username,
        });
        if (!success)
          return NextResponse.json({ success, errCode }, { status: 500 });
      }

      const { files, filesData, filesToRemove, ...data } = formData;
      frames = filesData?.length ? await uploadFiles({ files, filesData }) : [];

      session.startTransaction();
      const { available, errCode, options, result, success } = await handler({
        data,
        frames,
        user_id: user_id as string,
        username: username as string,
        session,
        req,
        params,
      });

      if (success) {
        const isFilesRemoved = await deleteMultipleMedia(filesToRemove);
        console.log(isFilesRemoved);
        tagOptions = { available, options };
        await session.commitTransaction();
      } else {
        await deleteFiles(frames);
        await session.abortTransaction().catch(console.error);
      }
      return NextResponse.json({ result, success, errCode });
    } catch (err: any) {
      await session?.abortTransaction().catch(console.error);
      console.error(
        `Error occured at path ${req.nextUrl.pathname} while updating data`,
        err.message
      );
      await deleteFiles(frames);
      return NextResponse.json({
        result: null,
        success: false,
        errCode: "pp100",
      });
    } finally {
      session?.endSession();
      if (tagOptions) {
        const { available, options } = tagOptions;
        getCacheTags({ type: "revalidate", available, options }).forEach(
          (tag) => {
            revalidateTag(tag);
          }
        );
      }
    }
  };
};

// FUNCTIONS TO FETCH DATA BOTH ON SERVER AND CLIENT SIDE

export const fetchCurrentUser = async (id: string) =>
  await ppGetData({
    url: `private/${id}/user/me`,
    revalidate: oneDay * 2,
    tag: "currentUser_uid",
    options: { uid: id },
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

  if (!response.success && response.errCode === "pp104")
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
    options: { filter: filter || queryFilters.threads[0], page },
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
  uid: string
): Promise<GeneralGetReturn> => {
  if (!uid) return { success: false, errCode: "pp202" };
  const response = await ppGetData({
    url: `private/${uid}/thread/${tid}/member`,
    revalidate: oneDay * 2,
    tag: "member_tid_uid",
    options: { tid, uid },
  });

  return response;
};

export const searchMembers = async (tid: string, query: string, page: string) =>
  await ppGetData({
    url: `search/members/${tid}?q=${query}&p=${page}`,
    revalidate: 0,
    options: null,
  });

export const threadsByUser = async (uid: string, page = 1) =>
  await ppGetData({
    url: `private/${uid}/user/me/threads?p=${page}`,
    revalidate: oneDay * 2,
    tag: "threadsByUser_uid_page",
    options: { uid, page },
  });

export const getPostsOfThread = async (
  tid: string,
  page: number,
  filter: string,
  tag?: string
): Promise<GeneralMultipleReturn> =>
  await ppGetData({
    url: `post/thread/${tid}?p=${page}&f=${filter || "latest"}${
      tag ? `&t=${tag}` : ""
    }`,
    revalidate: oneDay,
    tag: "postsOfThread_filter_tid_page_tag",
    options: {
      filter: filter || queryFilters.posts[0],
      tid,
      page,
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
    options: { filter: filter || queryFilters.posts[0], username, page },
  });

export const getReactionOnPost = async (
  pid: string,
  uid: string
): Promise<GeneralGetReturn> => {
  if (!uid) return { success: true, result: null };
  const response = await ppGetData({
    url: `private/${uid}/post/${pid}/reaction`,
    revalidate: oneDay * 2,
    tag: "reaction_pid_uid",
    options: { pid, uid },
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
    options: { filter: filter || "loved", username, page },
  });

export const getListsOfUser = async (
  username: string,
  page: number,
  filter: string
) =>
  await ppGetData({
    url: `list/user/${username}?p=${page}&f=${filter || "recently_added"}`,
    revalidate: oneDay * 3,
    tag: "listsOfUser_filter_username_page",
    options: { filter: filter || "recently_added", username, page },
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
    options: { pid: id, page },
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
    options: { filter: filter || queryFilters.comments[0], pid: id, page },
  });

export const getCommentById = async (id: string) =>
  await ppGetData({
    url: `comment/${id}`,
    revalidate: oneDay,
    tag: "comment_cid",
    options: { cid: id },
  });

export const getVoteOnComment = async (
  cid: string,
  uid: string
): Promise<GeneralGetReturn> => {
  if (!uid) return { success: false, errCode: "pp202" };
  const response = await ppGetData({
    url: `private/${uid}/comment/${cid}/vote`,
    revalidate: oneDay * 2,
    tag: "vote_cid_uid",
    options: { cid, uid },
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
    options: { cid: id, filter, page },
  });

export const getThreadsForMedia = async (
  id: string,
  page: string,
  filter: string
) =>
  await ppGetData({
    url: `thread/media/${id}?p=${page}f=${filter || "popular"}`,
    revalidate: oneDay * 3,
    options: null,
  });

export const getUserByUsername = async (username: string) =>
  await ppGetData({
    url: `user/${username}`,
    revalidate: oneDay * 2,
    tag: "user_username",
    options: { username },
  });

export const getMediaItem = async (
  tmdbid: string,
  type: "movie" | "show"
): Promise<FullMediaItemType | null> => {
  if (!tmdbid) return null;
  const id = tmdbid.split("-")[0];
  const item = await ppGetData({
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

  const { result, errCode } = await axios
    .post(`${getLocalUrl()}/api/v1/media/${id}`, objectToFormData(data))
    .then((r) => r.data);

  console.log(errCode);
  return result;
};

export const getListsForMedia = async (id: string, uid: string) =>
  await ppGetData({
    url: `/private/${uid}/media/${id}`,
    tag: "listsForMedia_mid_uid",
    options: { mid: id, uid },
    revalidate: oneDay,
  });

export const getList = async (id: string): Promise<GeneralGetReturn> => {
  if (!id) return { success: false, errCode: "pp104" };

  return await ppGetData({
    url: `list/${id}`,
    revalidate: oneDay * 2,
    tag: "list_lid",
    options: { lid: id },
  });
};

export const getItems = async (
  id: string,
  page: number,
  filter: string
): Promise<GeneralGetReturn> => {
  if (!id) return { success: false, errCode: "pp104" };

  return await ppGetData({
    url: `list/${id}/items?p=${page}&f=${filter}`,
    revalidate: oneDay,
    tag: "items_lid_filter_page",
    options: { lid: id, filter, page },
  });
};

export const searchPosts = async (query: string, nsfw: boolean, page = 1) => {
  const { success, result } = await ppGetData({
    url: `search/posts?q=${query}${nsfw ? "&nsfw=true" : ""}&p=${page}`,
    revalidate: oneDay,
    options: null,
  });

  if (success) return result;
};

export const searchComments = async (
  query: string,
  nsfw: boolean,
  page = 1
) => {
  const { success, result } = await ppGetData({
    url: `search/comments?q=${query}${nsfw ? "&nsfw=true" : ""}&p=${page}`,
    revalidate: oneDay,
    options: null,
  });
  if (success) return result;
};

export const searchThreads = async (query: string, nsfw: boolean, page = 1) => {
  const { success, result } = await ppGetData({
    url: `search/threads?q=${query}${nsfw ? "&nsfw=true" : ""}&p=${page}`,
    revalidate: oneDay,
    options: null,
  });
  if (success) return result;
};

export const searchUsers = async (query: string, page = 1) => {
  const { success, result } = await ppGetData({
    url: `search/users?q=${query}&p=${page}`,
    revalidate: oneDay,
    options: null,
  });
  if (success) return result;
};

export const searchLists = async (query: string, page = 1) => {
  const { success, result } = await ppGetData({
    url: `search/lists?q=${query}&p=${page}`,
    revalidate: oneDay,
    options: null,
  });
  if (success) return result;
};

export const checkIfItemSaved = async (id: string, uid: string) => {
  const response = await ppGetData({
    url: `private/${uid}/bookmark/${id}`,
    revalidate: oneDay * 2,
    tag: "isSaved_uid_id",
    options: { uid, id },
  });
  return response;
};

export const checkUserConnection = async (
  uid: string,
  rid: string
): Promise<GeneralGetReturn> => {
  const response = await ppGetData({
    url: `private/${uid}/user/${rid}/follow`,
    revalidate: oneDay * 2,
    tag: "connection_rid_uid",
    options: { uid, rid },
  });
  return response;
};
