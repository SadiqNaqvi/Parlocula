import { connectPPDB } from "@lib/database";
import { FrameDataSchemaType } from "@type/schemas";
import { formDataToObject, getCacheTags, objectToFormData } from "@lib/utils";
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
import axios from "axios";
import { ClientSession, startSession } from "mongoose";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { oneDay, oneWeek, queryFilters } from "../constants";
import { deleteMultipleMedia, mediaUploader } from "./server";
import { verifyToken } from "@lib/auth";

// HELPER FUNCTIONS

export const getRequest = (
  handler: (req: any, params?: any) => Promise<GeneralGetReturn>
) => {
  return async function (req: NextRequest, { params }: { params?: any }) {
    try {
      const isDbConnected = await connectPPDB();
      if (!isDbConnected)
        return NextResponse.json({
          result: null,
          success: false,
          errCode: "pp101",
        });

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
    return await fetch(
      `${process.env.__NEXT_PRIVATE_ORIGIN || ""}/api/v1/${url}`,
      {
        next: { revalidate, tags: cacheTags },
      }
    ).then((res) => res.json());
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
      const resp = await mediaUploader(file, {
        format: "auto",
        resource_type: "auto",
      });
      return resp.success ? resp.result.public_id : null;
    });

  const results = await Promise.all(promises);

  return filesData
    .map(({ isExternal, path, type }) => {
      if (isExternal) return { path, type, isExternal };
      const url = results.shift();
      if (url) return { path: url, type, isExternal };
      else return false;
    })
    .filter(Boolean) as Frame[];
};

const deleteFiles = async (files: Frame[]) => {
  if (!files.length) return;
  const ids = files.filter((file) => !file.path.includes("https"));
  await deleteMultipleMedia(ids.map((id) => id.path));
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
    const token = req.cookies.get("token")?.value;

    if (
      !(
        req.url.includes("user/register") ||
        req.url.includes("user/login") ||
        req.url.includes("api/v1/media")
      ) &&
      !token
    )
      return NextResponse.json(
        {
          success: false,
          errCode: "pp202",
          result: null,
        },
        { status: 500 }
      );

    const payload = token
      ? await verifyToken(token)
      : { user_id: "", username: "" };

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
          (tag) => {
            revalidateTag(tag);
          }
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
    const token = req.cookies.get("token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!token || !payload)
      return NextResponse.json({ success: false, errCode: "pp202" });

    const user_id = payload.user_id;
    const username = payload.username;
    let tagOptions: cacheOptions | null = null;

    const session = await startSession();

    try {
      const isDbConnected = await connectPPDB();
      if (!isDbConnected)
        return NextResponse.json({ success: false, errCode: "pp101" });

      if (precheck) {
        const { success, errCode } = await precheck(req, params);
        if (!success) return NextResponse.json({ success, errCode });
      }

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
      console.error("Error occured while deleting resource", err);
      return NextResponse.json({
        success: false,
        errCode: "pp100",
      });
    } finally {
      session.endSession();
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

const checkFilesToRemove = ({ n, o }: { n: Frame[]; o: Frame[] }) => {
  if (!n.length || !o.length) return [];
  return o
    .map((file) => (n.find((el) => el.path === file.path) ? false : file))
    .filter(Boolean) as Frame[];
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
    const token = req.cookies.get("token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!token || !payload)
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
    let frames = [];
    const session = await startSession();
    try {
      const isDbConnected = await connectPPDB();
      if (!isDbConnected)
        return NextResponse.json({
          result: null,
          success: false,
          errCode: "pp101",
        });

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

      const { files, filesData, ...data } = formData;
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
        deleteFiles(checkFilesToRemove({ n: frames, o: data.oldFiles }));
        tagOptions = { available, options };
        await session.commitTransaction();
      } else {
        await deleteFiles(frames);
        await session.abortTransaction().catch(console.error);
      }
      return NextResponse.json({ result, success, errCode });
    } catch (err: any) {
      await session.abortTransaction().catch(console.error);
      console.error(
        `Error occured at path ${req.nextUrl.pathname} while updating data`,
        err.message
      );
      return NextResponse.json({
        result: null,
        success: false,
        errCode: "pp100",
      });
    } finally {
      session.endSession();
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

export const getThreadById = async (
  id: string
): Promise<GeneralGetReturn<Thread>> =>
  await ppGetData({
    url: `thread/${id}`,
    revalidate: oneWeek,
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

export const getPostsOfThread = async (
  tid: string,
  page: number,
  filter: string,
  tag?: string
): Promise<GeneralMultipleReturn> =>
  await ppGetData({
    url: `post/thread/${tid}?p=${page}&f=${filter || "latest"}${tag || ""}`,
    revalidate: oneDay,
    tag: "filteredPostsOfThread_filter_tid_page",
    options: { filter: filter || queryFilters.posts[0], tid, page },
  });

export const getPostsOfUser = async (
  username: string,
  page: number,
  filter: string = "latest"
) =>
  await ppGetData({
    url: `post/user/${username}?p=${page}&f=${filter || "latest"}`,
    revalidate: oneDay * 3,
    tag: "filteredPostsOfUser_username_filter_page",
    options: { filter: filter || queryFilters.posts[0], username, page },
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

export const getRepliesOnComment = async (id: string) =>
  await ppGetData({
    url: `comment/${id}/replies`,
    revalidate: oneDay,
    tag: "replies_cid",
    options: { cid: id },
  });

export const getUserByUsername = async (username: string) =>
  await ppGetData({
    url: `user/${username}`,
    revalidate: oneDay * 3,
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
    revalidate: oneWeek,
    tag: "media_tmdbid",
    options: { tmdbid: id },
  });

  if (item.success) return item.result;

  const media = await fetch(
    `https://testlalaapp.vercel.app/api/${type}?id=${tmdbid}`,
    { next: { revalidate: oneWeek } }
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
    .post(
      `${process.env.__NEXT_PRIVATE_ORIGIN || ""}/api/v1/media/${id}`,
      objectToFormData(data)
    )
    .then((r) => r.data);

  console.log(errCode);
  return result;
};

export const getList = async (id: string): Promise<GeneralGetReturn> => {
  if (!id) return { success: false, errCode: "pp104" };

  return await ppGetData({
    url: `list/${id}`,
    revalidate: oneWeek,
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
    options: { lid: id },
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
