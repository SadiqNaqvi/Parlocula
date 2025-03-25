"use client";

import {
  CommentSchemaType,
  ListSchemaType,
  PostSchemaType,
  ThreadSchemaServer,
} from "@lib/schemas";
import { GeneralGetReturn, GeneralPostReturn, User } from "@type/internal";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { oneWeek } from "../constants";
import { convertCodeIntoError, objectToFormData } from "../utils";
import { ppGetData } from "./actions";

const updateRecentlyAdded = ({
  name,
  poster,
  _id,
  setUserHash,
  user,
}: {
  name: string;
  poster: string | null;
  _id: string;
  setUserHash: any;
  user: User | null;
}) => {
  if (!user) return;
  const recentlyJoined = user.recently_joined;
  if (recentlyJoined.length >= 5) recentlyJoined.shift();
  setUserHash({
    ...user,
    recently_joined: [...recentlyJoined, { name, poster: poster ?? "", _id }],
  });
};

export const ppPostData = async ({
  url,
  data,
}: {
  url: string;
  data: any;
}): Promise<GeneralPostReturn> => {
  try {
    return (
      await axios.post(
        `${process.env.__NEXT_PRIVATE_ORIGIN || ""}/api/v1/${url}`,
        objectToFormData(data)
      )
    ).data;
  } catch (err) {
    console.error(`Failed to post at ${url}`, err);
    return {
      success: false,
      errCode: "pp200",
    };
  }
};

export const ppDeleteData = async (url: string): Promise<GeneralGetReturn> => {
  try {
    return await fetch(
      `${process.env.__NEXT_PRIVATE_ORIGIN || ""}/api/v1/${url}`,
      { method: "DELETE" }
    ).then((res) => res.json());
  } catch (err) {
    console.error(`Failed to post at ${url}`, err);
    return {
      success: false,
      errCode: "pp200",
    };
  }
};

export const register = async (data: any, setUserHash: any) => {
  const { success, result, errCode, formError } = await ppPostData({
    url: `user/register`,
    data,
  });
  if (!success) return convertCodeIntoError(errCode, formError);
  setUserHash(result);
};

export const login = async (
  email: string,
  setUserHash: any
): Promise<string | void> => {
  const { success, result, errCode } = await ppPostData({
    url: `user/login`,
    data: { email },
  });
  if (!success) return convertCodeIntoError(errCode) as string;
  setUserHash(result);
};

export const logout = async (uid: string, clearUser: any) => {
  const { success, errCode } = await ppDeleteData("user/logout");
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
  if (user.object_expiry < Date.now()) {
    await ppGetData({
      url: "user/me",
      revalidate: oneWeek,
      tag: "currentUser_uid",
      options: { uid: user._id },
      // }).then((res) => res);
    }).then(({ result, success, errCode }) => {
      if (!success && errCode === "pp202") clearUser();
      else if (success && result) setUserHash(result);
    });
    // console.log("user:", result);
    // console.log("User fetch hua");
  }
};

export const isUsernameAvailable = async (
  username: string
): Promise<GeneralGetReturn> => {
  if (!username) return { success: true, result: false };
  return await ppGetData({
    url: `user/isUsernameAvailable?username=${username}`,
    revalidate: oneWeek,
    tag: "usernameAvailability_username",
    options: { username },
  });
};

export const checkIfUserExist = async (email: string) =>
  await ppGetData({
    url: `user/ifUserExist?email=${email}`,
    revalidate: oneWeek,
    tag: "userExistence_email",
    options: { email },
  });

export const createThread = async ({
  data,
  user,
  setUserHash,
}: {
  data: ThreadSchemaServer;
  user: any;
  setUserHash: any;
}) => {
  const { success, errCode, result, formError } = await ppPostData({
    url: "private/threads/new",
    data,
  });

  if (!success) return convertCodeIntoError(errCode, formError);
  const { _id, name, poster } = result;
  updateRecentlyAdded({ name, _id, poster, setUserHash, user });
  useRouter().replace(`t/${_id}`);
};

export const createPost = async (data: PostSchemaType) => {
  const { thread_id } = data;
  if (!thread_id) return convertCodeIntoError("pp204");

  const { success, errCode, result, formError } = await ppPostData({
    url: `private/threads/${thread_id}`,
    data,
  });

  if (!success) return convertCodeIntoError(errCode, formError);
  const { _id } = result;
  useRouter().replace(`p/${_id}`);
};

export const deletePost = async (id: string, username: string) => {
  if (!username) return convertCodeIntoError("pp202");
  const { errCode, success } = await ppDeleteData(`post/${id}`);
  if (!success) return convertCodeIntoError(errCode);
};

export const isMember = async ({
  tid,
  uid,
}: {
  tid: string;
  uid: string;
}): Promise<GeneralGetReturn> => {
  if (!uid) return { success: true, result: null };
  return await ppGetData({
    url: `private/thread/${tid}/member`,
    revalidate: oneWeek,
    tag: "member_tid_uid",
    options: { tid, uid },
  });
};

export const joinThread = async ({
  tid,
  tname,
  tposter,
  setUserHash,
  user,
}: {
  tid: string;
  tname: string;
  tposter: string;
  setUserHash: any;
  user: any;
}) => {
  const { success, errCode } = await ppPostData({
    url: `private/thread/${tid}/member`,
    data: {},
  });

  if (!success) return convertCodeIntoError(errCode) as string;
  updateRecentlyAdded({
    name: tname,
    _id: tid,
    poster: tposter,
    setUserHash,
    user,
  });
};

export const leaveThread = async ({
  tid,
  setUserHash,
  user,
}: {
  tid: string;
  setUserHash: any;
  user: User | null;
}) => {
  if (!user) return convertCodeIntoError("pp202") as string;
  const { errCode, success } = await ppDeleteData(
    `private/thread/${tid}/member`
  );
  if (!success) return convertCodeIntoError(errCode) as string;
  setUserHash({
    ...user,
    recently_joined: user.recently_joined.filter((el) => el._id !== tid),
  });
};

export const threadsByUser = async (username: string) =>
  await ppGetData({
    url: "user/me/threads",
    revalidate: oneWeek,
    tag: "threadsByUser_username",
    options: { username },
  });

export const getReactionOnPost = async ({
  pid,
  uid,
}: {
  pid: string;
  uid: string;
}): Promise<GeneralGetReturn> => {
  if (!uid) return { success: true, result: null };
  return await ppGetData({
    url: `private/post/${pid}/reaction`,
    revalidate: oneWeek,
    tag: "reaction_pid_uid",
    options: { pid, uid },
  });
};

export const addReactionOnPost = async (
  reaction: string,
  pid: string
): Promise<string | undefined> => {
  const { success, errCode, formError } = await ppPostData({
    url: `private/post/${pid}/reaction`,
    data: { reaction },
  });

  if (formError) return convertCodeIntoError("pp500") as string;
  else if (!success) return convertCodeIntoError(errCode) as string;
};

export const removeReactionOnPost = async (
  pid: string
): Promise<string | undefined> => {
  const { success, errCode } = await ppDeleteData(
    `private/post/${pid}/reaction`
  );

  if (!success) return convertCodeIntoError(errCode) as string;
};

export const getVoteOnComment = async ({
  cid,
  uid,
}: {
  cid: string;
  uid?: string;
}): Promise<GeneralGetReturn> => {
  if (!uid) return { success: true, result: null };
  return await ppGetData({
    url: `private/comment/${cid}/vote`,
    revalidate: oneWeek,
    tag: "vote_cid_uid",
    options: { cid, uid },
  });
};

export const createCommentOnPost = async (data: CommentSchemaType) => {
  const { errCode, success, formError } = await ppPostData({
    url: "private/comment",
    data,
  });
  if (formError) return convertCodeIntoError("pp500") as string;
  if (!success) return convertCodeIntoError(errCode) as string;
};

export const createList = async (
  data: ListSchemaType,
  user: any,
  setUserHash: any
) => {
  const { success, errCode, formError, result } = await ppPostData({
    url: `private/list`,
    data,
  });

  if (!success && formError) return convertCodeIntoError(errCode, formError);
  else if (!success) {
    toast.error(convertCodeIntoError(errCode) as string);
    return;
  }

  const { title, _id } = result;

  setUserHash({
    ...user,
    lists: [{ _id, title }, ...user.lists],
  });
};

export const updatingListsWithItem = async (id: string, data: any) => {
  if (!id || !data) return { success: false, errCode: "pp204" };

  const { success, errCode, formError } = await ppPostData({
    data,
    url: `private/item/${id}`,
  });

  if (!success) return convertCodeIntoError(errCode, formError);
};