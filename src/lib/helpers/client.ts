"use client";

import {
  CommentSchemaType,
  ItemToAddAndRemoveType,
  ListSchemaType,
  PostSchemaType,
  bookmarkSchemaType,
  ThreadSchemaServer,
  InputMediaType,
} from "@type/schemas";
import { GeneralGetReturn, GeneralPostReturn, User } from "@type/internal";
import axios from "axios";
import toast from "react-hot-toast";
import { oneWeek } from "../constants";
import { convertCodeIntoError, objectToFormData, trycatch } from "../utils";
import { ppGetData } from "./common";
import { AvailableCacheTags } from "@type/other";
import { NextRouter } from "next/router";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { refineString } from "@lib/dataRefiner";

const clientGetRequests = async (args: {
  url: string;
  revalidate: number;
  tag?: AvailableCacheTags;
  options: any;
}): Promise<GeneralGetReturn> => {
  if (!navigator.onLine) return { success: false, errCode: "pp200" };
  return await ppGetData(args);
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

export const fetchCurrentUser = async ({
  clearUser,
  setUser,
  setUserHash,
  getUserFromHash,
}: {
  clearUser: any;
  setUser: any;
  setUserHash: any;
  getUserFromHash: any;
}) => {
  const user = getUserFromHash();

  if (!user) return;

  setUser(user);
  // if (user.object_expiry < Date.now()) {
  //   await clientGetRequests({
  //     url: `private/${user._id}/user/me`,
  //     revalidate: oneWeek,
  //     tag: "currentUser_uid",
  //     options: { uid: user._id },
  //   }).then(({ result, success, errCode }) => {
  //     if (!success && errCode === "pp202") clearUser();
  //     else if (success && result) setUserHash(result);
  //   });
  // }
};

export const isUsernameAvailable = async (
  username: string
): Promise<GeneralGetReturn> => {
  if (!username) return { success: true, result: false };
  return await clientGetRequests({
    url: `user/isUsernameAvailable?username=${username}`,
    revalidate: oneWeek,
    tag: "usernameAvailability_username",
    options: { username },
  });
};

export const checkIfUserExist = async (email: string) =>
  await clientGetRequests({
    url: `user/ifUserExist?email=${email}`,
    revalidate: oneWeek,
    tag: "userExistence_email",
    options: { email },
  });

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

export const deletePost = async (id: string, uid: string) => {
  const { errCode, success } = await ppDeleteData(`post/${id}`, uid);
  if (success) return true;
  toast.error("Unable to delte your post");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const isMember = async (
  tid: string,
  uid: string
): Promise<GeneralGetReturn> => {
  if (!uid) return { success: false, errCode: "pp202" };
  return await clientGetRequests({
    url: `private/${uid}/thread/${tid}/member`,
    revalidate: oneWeek,
    tag: "member_tid_uid",
    options: { tid, uid },
  });
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

export const threadsByUser = async (uid: string) =>
  await clientGetRequests({
    url: `private/${uid}/user/me/threads`,
    revalidate: oneWeek,
    tag: "threadsByUser_uid",
    options: { uid },
  });

export const getReactionOnPost = async (
  pid: string,
  uid: string
): Promise<GeneralGetReturn> => {
  if (!uid) return { success: true, result: null };
  return await clientGetRequests({
    url: `private/${uid}/post/${pid}/reaction`,
    revalidate: oneWeek,
    tag: "reaction_pid_uid",
    options: { pid, uid },
  });
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

export const getVoteOnComment = async (
  cid: string,
  uid: string
): Promise<GeneralGetReturn> => {
  if (!uid) return { success: false, errCode: "pp202" };
  return await clientGetRequests({
    url: `private/${uid}/comment/${cid}/vote`,
    revalidate: oneWeek,
    tag: "vote_cid_uid",
    options: { cid, uid },
  });
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

export const createList = async (data: ListSchemaType, uid: string) => {
  const { success, errCode, formError, result } = await ppPostData({
    url: "list",
    data,
    uid,
  });

  if (!success && formError) return convertCodeIntoError(errCode, formError);

  if (success) return true;
  toast.error("Unable to create the list");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const updatingListsWithItem = async (
  id: string,
  data: ItemToAddAndRemoveType,
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
  if (success) return true;
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

export const deleteMultipleItemsFromList = async (
  id: string,
  items: string[],
  uid: string
) => {
  const { success, errCode } = await ppPostData({
    url: `list/${id}/items`,
    data: items,
    uid,
  });

  if (success) return true;
  toast.error("Unable to remove items");
  toast.error(convertCodeIntoError(errCode) as string);
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

export const checkIfItemSaved = async (id: string, uid: string) =>
  await clientGetRequests({
    url: `private/${uid}/bookmark/${id}`,
    revalidate: oneWeek,
    tag: "isSaved_uid_id",
    options: { uid, id },
  });

export const unsaveItem = async (id: string, uid: string) => {
  const { success, errCode } = await ppDeleteData(`bookmark/${id}`, uid);

  if (success) return true;
  toast.error("Unable to unsave the content");
  toast.error(convertCodeIntoError(errCode) as string);
};

export const checkUserConnection = async (uid: string, rid: string) =>
  await clientGetRequests({
    url: `private/${uid}/user/${rid}/follow`,
    revalidate: oneWeek,
    tag: "connection_rid_uid",
    options: { uid, rid },
  });

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
