"use client";

import { setDataMutation } from "@lib/mutation";
import { QueryClient } from "@tanstack/react-query";
import { GeneralGetReturn, GeneralPostReturn } from "@type/internal";
import { AvailableCacheTags, ContentMutationProps } from "@type/other";
import {
  bookmarkSchemaType,
  CinementToAddAndRemoveType,
  CommentSchemaType,
  InputMediaType,
  ListEditSchema,
  ListSchemaType,
  PostSchemaType,
  ThreadSchemaServer,
  VoteSchemaType,
} from "@type/schemas";
import axios from "axios";
import toast from "react-hot-toast";
import { oneDay, oneWeek } from "../constants";
import {
  convertCodeIntoError,
  getCacheTags,
  getQueryKeys,
  objectToFormData,
  refineString,
  trycatch,
} from "../utils";
import { AppRouterInstance } from "@type/nextjs";

const clientGetRequests = async ({
  options,
  revalidate,
  url,
  tag,
}: {
  url: string;
  revalidate: number;
  tag?: AvailableCacheTags;
  options: any;
}): Promise<GeneralGetReturn> => {
  if (!navigator.onLine) return { success: false, errCode: "pp200" };
  const cacheTags =
    tag && getCacheTags({ type: "cache", available: tag, options });
  try {
    return await fetch(
      `${process.env.__NEXT_PRIVATE_ORIGIN || ""}/api/v1/${url}`,
      {
        next: { revalidate, tags: cacheTags },
        cache: revalidate ? "force-cache" : "no-store",
      }
    ).then((res) => res.json());
  } catch (err: any) {
    console.error(`Error occured at path ${url}`, err.message);
    return { success: false, errCode: "200" };
  }
};

export const ppPostData = async ({
  url,
  data,
  uid,
}: {
  url: string;
  data: any;
  uid: string;
}): Promise<GeneralPostReturn> => {
  if (!uid) return { success: false, errCode: "pp202" };
  // try {
  return await trycatch(() =>
    axios
      .post(
        `${
          process.env.__NEXT_PRIVATE_ORIGIN || ""
        }/api/v1/private/${uid}/${url}`,
        objectToFormData(data)
      )
      .then((r) => r.data)
  );
  // } catch (err) {
  //   console.error(`Failed to post at ${url}`, err);
  //   return {
  //     success: false,
  //     errCode: "pp200",
  //   };
  // }
};

export const ppUpdateData = async ({
  url,
  data,
  uid,
}: {
  url: string;
  data: any;
  uid: string;
}): Promise<GeneralPostReturn> => {
  // try {
  return await trycatch(() =>
    axios
      .patch(
        `${
          process.env.__NEXT_PRIVATE_ORIGIN || ""
        }/api/v1/private/${uid}/${url}`,
        objectToFormData(data)
      )
      .then((r) => r.data)
  );
  // } catch (err) {
  //   console.error(`Failed to post at ${url}`, err);
  //   return {
  //     success: false,
  //     errCode: "pp200",
  //   };
  // }
};

export const ppDeleteData = async (
  url: string,
  uid: string
): Promise<GeneralGetReturn> => {
  // try {
  return await trycatch(() =>
    axios
      .delete(
        `${
          process.env.__NEXT_PRIVATE_ORIGIN || ""
        }/api/v1/private/${uid}/${url}`
      )
      .then((res) => res.data)
  );
  // } catch (err) {
  //   console.error(`Failed to post at ${url}`, err);
  //   return {
  //     success: false,
  //     errCode: "pp200",
  //   };
  // }
};

export const register = async (data: any, setUserHash: any) => {
  const { success, result, errCode, formError } = await trycatch(() =>
    axios
      .post(
        `${process.env.__NEXT_PRIVATE_ORIGIN || ""}/api/v1/user/register`,
        objectToFormData(data)
      )
      .then((r) => r.data)
  );
  if (!success) {
    if (errCode === "pp203") return convertCodeIntoError(errCode, formError);
    else {
      toast.error("Unable to join you.");
      toast.error(convertCodeIntoError(errCode) as string);
    }
  }
  setUserHash(result);
};

export const login = async (email: string, setUserHash: any) => {
  const { success, result, errCode } = await trycatch(() =>
    axios
      .post(
        `${process.env.__NEXT_PRIVATE_ORIGIN || ""}/api/v1/user/login`,
        objectToFormData({ email })
      )
      .then((r) => r.data)
  );

  console.log(result);

  if (success) {
    setUserHash(result);
    return true;
  }

  toast.error("Unable to log-in");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const logout = async (uid: string, clearUser: any) => {
  const { success, errCode } = await ppDeleteData("user/logout", uid);
  if (!success) return convertCodeIntoError(errCode);
  clearUser();
};

export const createThread = async (
  data: ThreadSchemaServer,
  uid: string,
  router: AppRouterInstance,
  updateThreads: any
) => {
  const { success, errCode, result, formError } = await ppPostData({
    url: "thread",
    data,
    uid,
  });

  if (!success) {
    if (errCode === "pp203") return convertCodeIntoError(errCode, formError);
    else {
      toast.error("Unable to create thread.");
      toast.error(convertCodeIntoError(errCode) as string);
    }
  }

  if (success) {
    const { _id, name, poster } = result;

    updateThreads({ data: { _id, name, poster }, action: "add" });
    router.replace(`/t/${result._id}-${refineString(name)}`);
  }
};

export const createPost = async (
  data: PostSchemaType,
  uid: string,
  router: AppRouterInstance
) => {
  const { thread_id } = data;
  if (!thread_id) return convertCodeIntoError("pp204");

  const { success, errCode, result, formError } = await ppPostData({
    url: "post",
    data,
    uid,
  });

  if (!success) {
    if (errCode === "pp203") return convertCodeIntoError(errCode, formError);
    else {
      toast.error("Unable to create post.");
      toast.error(convertCodeIntoError(errCode) as string);
    }
  }
  if (success) {
    const { _id, title } = result;
    router.replace(`/p/${_id}-${refineString(title)}`);
  }
};

export const updatePost = async (
  pid: string,
  uid: string,
  data: any,
  router: AppRouterInstance,
  queryClient: QueryClient
) => {
  if (!pid || !uid)
    return "Something Went Wrong! Please go back and try again.";

  const { success, errCode, formError, result } = await ppUpdateData({
    url: `post/${pid}`,
    data,
    uid,
  });

  if (success) {
    await setDataMutation(
      result,
      getQueryKeys("post_id", { id: pid }),
      queryClient
    );
    router.replace(`/p/${pid}`);
  } else {
    if (errCode === "pp203") return convertCodeIntoError(errCode, formError);
    else {
      toast.error("Unable to create post.");
      toast.error(convertCodeIntoError(errCode) as string);
    }
  }
};

export const deletePost = async (id: string, uid: string) => {
  const { errCode, success } = await ppDeleteData(`post/${id}`, uid);
  if (success) return true;
  toast.error("Unable to delte your post");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const joinThread = async (tid: string, uid: string) => {
  const { success, errCode } = await ppPostData({
    url: `thread/${tid}/member`,
    data: null,
    uid,
  });

  if (success) return true;
  toast.error("Unable to join thread");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const leaveThread = async (tid: string, uid: string) => {
  const { errCode, success } = await ppDeleteData(`thread/${tid}/member`, uid);
  if (success) return true;
  toast.error("Unable to leave thread");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const changeThreadNotification = async (
  tid: string,
  uid: string,
  newState: boolean
) => {
  const { errCode, success } = await ppUpdateData({
    url: `thread/${tid}/member`,
    uid,
    data: { notification: newState },
  });
  if (success) return true;
  toast.error(
    `Unable to ${newState ? "Enable" : "Disable"} notification of the thread`
  );
  toast.error(convertCodeIntoError(errCode) as string);
};

export const addReactionOnPost = async (
  uid: string,
  pid: string,
  reaction: string
) => {
  const { success, errCode } = await ppPostData({
    url: `post/${pid}/reaction`,
    data: { reaction },
    uid,
  });

  if (success) return true;
  toast.error("Unable to react on post");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const removeReactionOnPost = async (pid: string, uid: string) => {
  const { success, errCode } = await ppDeleteData(`post/${pid}/reaction`, uid);

  if (success) return true;
  toast.error("Unable to remove your reaction from the post");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const createCommentOnPost = async (
  data: CommentSchemaType,
  uid: string
) => {
  const { errCode, success, formError } = await ppPostData({
    url: "comment",
    data,
    uid,
  });
  if (success) return true;
  toast.error("Unable to comment");
  toast.error(convertCodeIntoError(formError ? "pp500" : errCode) as string);
};

export const voteOnComment = async (
  cid: string,
  uid: string,
  data: VoteSchemaType
) => {
  const { errCode, success } = await ppPostData({
    url: `comment/${cid}/vote`,
    data,
    uid,
  });
  if (success) return true;
  toast.error("Unable to comment");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const removeVoteOnComment = async (cid: string, uid: string) => {
  const { errCode, success } = await ppDeleteData(`comment/${cid}/vote`, uid);
  if (success) return true;
  toast.error("Unable to comment");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const createList = async (
  data: ListSchemaType,
  uid: string,
  updateFunc: (__0: ContentMutationProps) => void
) => {
  const { success, errCode, formError, result } = await ppPostData({
    url: "list",
    data,
    uid,
  });

  if (!success && formError) return convertCodeIntoError(errCode, formError);

  if (success) {
    const { _id, name, poster } = result;
    return updateFunc({ data: { _id, name, poster }, action: "add" });
  }
  toast.error("Unable to create the list");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const updatingListsWithItem = async (
  id: string,
  data: CinementToAddAndRemoveType,
  uid: string
) => {
  if (!id || !data) return { success: false, errCode: "pp204" };

  const { success, errCode, formError } = await ppPostData({
    url: `item/${id}`,
    data,
    uid,
  });

  if (!success && errCode === "pp203")
    return convertCodeIntoError(errCode, formError);
  else if (success) return true;
  toast.error("Unable to update lists");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const addItemsToList = async (
  id: string,
  data: { items: InputMediaType[] },
  uid: string
) => {
  const { success, errCode } = await ppPostData({
    url: `list/${id}`,
    data,
    uid,
  });

  if (success) return true;
  toast.error("Unable to add items");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const updateList = async (
  id: string,
  data: ListEditSchema,
  uid: string,
  router: AppRouterInstance
) => {
  router.replace(`l/${id}`);
  const { success, errCode } = await ppUpdateData({
    url: `list/${id}`,
    data,
    uid,
  });

  if (success) return true;
  else {
    toast.error("Unable to update list");
    toast.error(convertCodeIntoError(errCode) as string);
  }
  return false;
};

export const deleteList = async (
  id: string,
  uid: string,
  updateFunc: (__0: ContentMutationProps) => void
) => {
  const { success, errCode } = await ppDeleteData(`list/${id}`, uid);

  if (success) updateFunc({ action: "remove", data: { id } });
  else {
    toast.error("Unable to delete list");
    toast.error(convertCodeIntoError(errCode) as string);
  }
};

export const saveItem = async (data: bookmarkSchemaType, uid: string) => {
  const { success, errCode } = await ppPostData({
    url: "bookmark",
    data,
    uid,
  });

  if (success) return true;
  toast.error("Unable to save the content");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const unsaveItem = async (id: string, uid: string) => {
  const { success, errCode } = await ppDeleteData(`bookmark/${id}`, uid);

  if (success) return true;
  toast.error("Unable to unsave the content");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const follow = async (uid: string, rid: string) => {
  const { success, errCode } = await ppPostData({
    url: `user/${rid}/follow`,
    data: null,
    uid,
  });
  if (success) return true;
  toast.error("Unable to follow the user");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const block = async (uid: string, rid: string) => {
  const { success, errCode } = await ppPostData({
    url: `user/${rid}/block`,
    data: null,
    uid,
  });
  if (success) return true;
  toast.error("Unable to block the user");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const unfollow = async (uid: string, rid: string) => {
  const { success, errCode } = await ppDeleteData(`user/${rid}/follow`, uid);

  if (success) return true;
  toast.error("Unable to unfollow the user");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const unblock = async (uid: string, rid: string) => {
  const { success, errCode } = await ppDeleteData(`user/${rid}/block`, uid);

  if (success) return true;
  toast.error("Unable to unblock the user");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const modifyNotification = async (
  uid: string,
  rid: string,
  data: { notification: boolean }
) => {
  const { success, errCode } = await ppUpdateData({
    url: `user/${rid}/block`,
    data,
    uid,
  });

  if (success) return true;
  toast.error(
    `Unable to turn ${data.notification ? "on" : "off"} notification`
  );
  toast.error(convertCodeIntoError(errCode) as string);
};

export const removeFollower = async (uid: string, rid: string) => {
  const { success, errCode } = await ppDeleteData(`user/${rid}/follower`, uid);

  if (success) return true;
  toast.error("Unable to remove follower");
  toast.error(convertCodeIntoError(errCode) as string);
};
