"use client";

import { setDataMutation } from "@lib/mutation";
import useCurrentUser from "@store/user";
import { QueryClient } from "@tanstack/react-query";
import { GeneralGetReturn, GeneralPostReturn } from "@type/internal";
import { AppRouterInstance } from "@type/nextjs";
import { ContentMutationProps } from "@type/other";
import {
  bookmarkSchemaType,
  CinementToAddAndRemoveType,
  CommentSchemaType,
  CommentSchemaUpdateType,
  InputMediaType,
  ListEditSchema,
  ListSchemaType,
  MessageSchemaType,
  PostSchemaType,
  PostUpdateSchemaType,
  ReportActionSchemaType,
  RoomSchemaType,
  SessionInvalidationServerSchemaType,
  ThreadSchemaServer,
  ThreadUpdateSchema,
  UserUpdateSchemaType,
  VoteSchemaType,
} from "@type/schemas";
import axios from "axios";
import {
  codetoError,
  getLocalUrl,
  getQueryKeys,
  handleMutationResponse,
  objectToFormData,
  refineString,
  trycatch,
} from "../utils";
import { setUserOnRefreshOrLogin } from "./user";

export const ppPostData = async ({
  url,
  data,
  uid,
}: {
  url: string;
  data?: any;
  uid: string;
}): Promise<GeneralPostReturn> => {
  if (!uid) return { success: false, errCode: "unauthenticated_access" };
  return await trycatch(() =>
    axios
      .post(
        `${getLocalUrl()}/api/v1/private/${uid}/${url}`,
        data ? objectToFormData(data) : new FormData(),
      )
      .then((r) => r.data)
  );
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
        `${getLocalUrl()}/api/v1/private/${uid}/${url}`,
        objectToFormData(data)
      )
      .then((r) => r.data)
  );
  // } catch (err) {
  //   console.error(`Failed to post at ${url}`, err);
  //   return {
  //     success: false,
  //     errCode: "unstable_internet",
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
      .delete(`${getLocalUrl()}/api/v1/private/${uid}/${url}`)
      .then((res) => res.data)
  );
  // } catch (err) {
  //   console.error(`Failed to post at ${url}`, err);
  //   return {
  //     success: false,
  //     errCode: "unstable_internet",
  //   };
  // }
};

export const register = async (data: any, setUserHash: any) =>
  handleMutationResponse({
    response: await trycatch(() =>
      axios
        .post(`${getLocalUrl()}/api/v1/user/register`, objectToFormData(data))
        .then((r) => r.data)
    ),
    onSuccess: (r) => setUserHash(r),
    message: "Unable to register.",
  });

export const login = async (email: string, code: number) => {
  const { success, errCode, result } = await trycatch<GeneralPostReturn>(() =>
    axios
      .post(
        `${getLocalUrl()}/api/v1/user/login`,
        objectToFormData({ email, code })
      )
      .then((r) => r.data)
  );

  if (success) setUserOnRefreshOrLogin(result);

  return { success, errCode }
};

export const invalidateSession = async (data: SessionInvalidationServerSchemaType) =>
  await trycatch<GeneralPostReturn>(() =>
    axios.patch(
      `${getLocalUrl()}/api/v1/user/login`,
      objectToFormData(data)
    )
      .then((r) => r.data)
  );

export const logout = async (uid: string) => {

  const clearUser = useCurrentUser.getState().clearUser;

  return handleMutationResponse({
    response: await ppDeleteData("user/logout", uid),
    onSuccess: clearUser,
    message: "Unable to log out!",
  });

}
export const createThread = async (
  data: ThreadSchemaServer,
  uid: string,
  router: AppRouterInstance,
  updateThreads: any
) =>
  handleMutationResponse({
    response: await ppPostData({ url: "thread", data, uid }),
    onSuccess: (r) => {
      const { _id, name, poster } = r;

      updateThreads({ data: { _id, name, poster }, action: "add" });
      router.replace(`/t/${_id}-${refineString(name)}`);
    },
    message: "Unable to create thread!",
  });

export const joinThread = async (tid: string, uid: string) =>
  handleMutationResponse({
    response: await ppPostData({
      url: `thread/${tid}/member`,
      data: null,
      uid,
    }),
    message: "Unable to join thread!",
  });

export const updateThread = async (
  tid: string,
  uid: string,
  data: ThreadUpdateSchema
) =>
  handleMutationResponse({
    response: await ppUpdateData({ url: `thread/${tid}`, data, uid }),
    onSuccess: () => {
      // UPDATE THREAD HERE
    },
    message: "Unable to update thread!",
  });

export const leaveThread = async (tid: string, uid: string) =>
  handleMutationResponse({
    response: await ppDeleteData(`thread/${tid}/member`, uid),
    message: "Unable to leave thread!",
  });

export const changeThreadNotification = async (
  tid: string,
  uid: string,
  newState: boolean
) =>
  handleMutationResponse({
    response: await ppUpdateData({
      url: `thread/${tid}/member`,
      uid,
      data: { notification: newState },
    }),
    message: `Unable to ${newState ? "enable" : "disable"} thread notification!`,
  });

export const createPost = async (
  data: PostSchemaType,
  uid: string,
  router: AppRouterInstance
) => {
  const { thread_id } = data;
  if (!thread_id) return codetoError("invalid_object_id");

  return handleMutationResponse({
    response: await ppPostData({ url: "post", data, uid }),
    onSuccess: (result) => {
      const { _id, title } = result;
      router.replace(`/p/${_id}-${refineString(title)}`);
    },
    message: "Unable to create post!",
  });
};

export const updatePost = async (
  pid: string,
  uid: string,
  data: PostUpdateSchemaType,
  router: AppRouterInstance,
  queryClient: QueryClient
) => {
  if (!pid || !uid) throw new Error("Post id or user id is invalid");

  return handleMutationResponse({
    response: await ppUpdateData({
      url: `post/${pid}`,
      data,
      uid,
    }),
    onSuccess: async (result) => {
      await setDataMutation(
        result,
        getQueryKeys("post_id", { id: pid }),
        queryClient
      );
      router.replace(`/p/${pid}`);
    },
    message: "Unable to update post!",
  });
};

export const deletePost = async (id: string, uid: string) =>
  handleMutationResponse({
    response: await ppDeleteData(`post/${id}`, uid),
    message: "Unable to delete post!",
  });

export const addReactionOnPost = async (
  uid: string,
  pid: string,
  reaction: string
) =>
  handleMutationResponse({
    response: await ppPostData({
      url: `post/${pid}/reaction`,
      data: { reaction },
      uid,
    }),
    message: "Unable to react on the post!",
  });

export const removeReactionOnPost = async (pid: string, uid: string) =>
  handleMutationResponse({
    response: await ppDeleteData(`post/${pid}/reaction`, uid),
    message: "Unable to remove reaction from the post!",
  });

export const createCommentOnPost = async (
  data: CommentSchemaType,
  uid: string
) =>
  handleMutationResponse({
    response: await ppPostData({
      url: "comment",
      data,
      uid,
    }),
    message: "Unable to comment on post!",
  });

export const updateComment = async (
  cid: string,
  uid: string,
  data: CommentSchemaUpdateType,
) => {
  if (!cid || !uid) throw new Error("Comment or user id is not provided.");
  return await handleMutationResponse({
    response: await ppUpdateData({
      url: `comment/${cid}`,
      data,
      uid,
    }),
    message: "Unable to update the comment!",
  });
};

export const deleteComment = async (cid: string, uid: string) =>
  handleMutationResponse({
    response: await ppDeleteData(`comment/${cid}`, uid),
    message: "Unable to delete comment!",
  });


export const voteOnComment = async (
  cid: string,
  uid: string,
  data: VoteSchemaType
) =>
  handleMutationResponse({
    response: await ppPostData({
      url: `comment/${cid}/vote`,
      data,
      uid,
    }),
    message: "Unable to vote on comment!",
  });

export const removeVoteOnComment = async (cid: string, uid: string) =>
  handleMutationResponse({
    response: await ppDeleteData(`comment/${cid}/vote`, uid),
    message: "Unable to remove vote on comment!",
  });

export const createList = async (
  data: ListSchemaType,
  uid: string,
) =>
  handleMutationResponse({
    response: await ppPostData({
      url: "list",
      data,
      uid,
    }),
    message: "Unable to create list!",
  });

export const updatingListsWithItem = async (
  id: string,
  data: CinementToAddAndRemoveType,
  uid: string
) => {
  if (!id || !data) return { success: false, errCode: "invalid_object_id" };

  return handleMutationResponse({
    response: await ppPostData({
      url: `item/${id}`,
      data,
      uid,
    }),
    message: "Unable to add cinement in lists!",
  });
};

export const addItemsToList = async (
  id: string,
  data: { items: InputMediaType[] },
  uid: string
) =>
  handleMutationResponse({
    response: await ppPostData({
      url: `list/${id}`,
      data,
      uid,
    }),
    message: "Unable to add cinements in the list!",
  });

export const updateList = async (
  id: string,
  data: ListEditSchema,
  uid: string,
  router: AppRouterInstance
) =>
  handleMutationResponse({
    response: await ppUpdateData({
      url: `list/${id}`,
      data,
      uid,
    }),
    onSuccess: () => router.replace(`l/${id}`),
    message: "Unable to update the list!",
  });

export const deleteList = async (
  id: string,
  uid: string,
  updateFunc: (__0: ContentMutationProps) => void
) =>
  handleMutationResponse({
    response: await ppDeleteData(`list/${id}`, uid),
    onSuccess: () => updateFunc({ action: "remove", data: { id } }),
    message: "Unable to delete list!",
  });

export const saveItem = async (data: bookmarkSchemaType, uid: string) =>
  handleMutationResponse({
    response: await ppPostData({
      url: "bookmark",
      data,
      uid,
    }),
    message: "Unable to save item!",
  });

export const unsaveItem = async (id: string, uid: string) =>
  handleMutationResponse({
    response: await ppDeleteData(`bookmark/${id}`, uid),
    message: "Unable to unsave item!",
  });

export const follow = async (uid: string, rid: string) =>
  handleMutationResponse({
    response: await ppPostData({
      url: `user/${rid}/follow`,
      data: null,
      uid,
    }),
    message: "Unable to follow user!",
  });

export const blockUser = async (uid: string, rid: string) =>
  handleMutationResponse({
    response: await ppPostData({
      url: `user/${rid}/block`,
      data: null,
      uid,
    }),
    message: "Unable to block user!",
  });

export const unfollow = async (uid: string, rid: string) =>
  handleMutationResponse({
    response: await ppDeleteData(`user/${rid}/follow`, uid),
    message: "Unable to unfollow user!",
  });

export const unblock = async (uid: string, rid: string) =>
  handleMutationResponse({
    response: await ppDeleteData(`user/${rid}/block`, uid),
    message: "Unable to unblock user!",
  });

export const modifyNotification = async (
  uid: string,
  rid: string,
  data: { notification: boolean }
) =>
  handleMutationResponse({
    response: await ppUpdateData({
      url: `user/${rid}/follow`,
      data,
      uid,
    }),
    message: `Unable to turn ${data.notification ? "on" : "off"} notification!`,
  });

export const removeFollower = async (uid: string, rid: string) =>
  handleMutationResponse({
    response: await ppDeleteData(`user/${rid}/follower`, uid),
    message: "Unable to remove user as follower!",
  });

export const updateUser = async (
  uid: string,
  data: UserUpdateSchemaType,
  setUserHash: (a: any) => void,
  queryClient: QueryClient,
  username: string
) =>
  handleMutationResponse({
    response: await ppUpdateData({
      url: "user",
      data,
      uid,
    }),
    onSuccess: (result) => {
      setUserHash(result);
      queryClient.setQueryData(
        getQueryKeys("user_username", { username }),
        result
      );
    },
    message: "Unable to update your info!",
  });

export const updateUsername = async (
  uid: string,
  data: { username: string; passkey: string },
  setUserHash: (a: any) => void,
  queryClient: QueryClient
) =>
  handleMutationResponse({
    response: await ppUpdateData({
      url: "user/creds/username",
      data,
      uid,
    }),
    onSuccess: (result) => {
      setUserHash(result);
      queryClient.setQueryData(
        getQueryKeys("user_username", { username: result.username }),
        result
      );
    },
    message: "Unable to update username!",
  });

export const updateEmail = async (
  uid: string,
  data: { email: string; passkey: string; code: number; encrypted: string },
  setUserHash: (a: any) => void
) =>
  handleMutationResponse({
    response: await ppUpdateData({
      url: "user/creds/email",
      data,
      uid,
    }),
    onSuccess: setUserHash,
    message: "Unable to update email!",
  });

export const inviteCollaborators = async (
  data: { users: string[]; list_name: string },
  lid: string,
  uid: string
) =>
  handleMutationResponse({
    response: await ppPostData({
      url: `/list/${lid}/collaborators`,
      data,
      uid,
    }),
    message: "Unable to invite users to collaborate!",
  });

export const removeCollaborators = async (
  data: { users: string[] },
  lid: string,
  uid: string
) =>
  handleMutationResponse({
    response: await ppUpdateData({
      url: `/list/${lid}/collaborators`,
      data,
      uid,
    }),
    message: "Unable to remove collaborators/invitees!",
  });

export const acceptCollaboratorInvitation = async (lid: string, uid: string) =>
  handleMutationResponse({
    response: await ppUpdateData({
      url: `list/${lid}/collaborators/action`,
      uid,
      data: null,
    }),
    message: "Unable to accept collaborator invitation!",
  });

export const rejectCollaboratorInvitation = async (lid: string, uid: string) =>
  handleMutationResponse({
    response: await ppDeleteData(`list/${lid}/collaborators/action`, uid),
    message: "Unable to reject collaborator invitation!",
  });

export const banMembers = async (
  tid: string,
  uid: string,
  data: { users: string[] }
) =>
  handleMutationResponse({
    response: await ppUpdateData({ url: `thread/${tid}/banned`, uid, data }),
    message: "Unable to ban members!",
  });

export const unbanMembers = async (
  tid: string,
  uid: string,
  data: { users: string[] }
) =>
  handleMutationResponse({
    response: await ppPostData({ url: `thread/${tid}/banned`, uid, data }),
    message: "Unable to unban members!",
  });

export const inviteManagers = async (
  tid: string,
  uid: string,
  data: { users: string[]; thread_name: string }
) =>
  handleMutationResponse({
    response: await ppPostData({
      url: `thread/${tid}/managers`,
      uid,
      data,
    }),
    message: "Unable to invite managers!",
  });

export const demoteManagers = async (
  tid: string,
  uid: string,
  data: { users: string[] }
) =>
  handleMutationResponse({
    response: await ppUpdateData({
      url: `thread/${tid}/managers`,
      uid,
      data,
    }),
    message: "Unable to demote managers!",
  });

export const acceptManagerInvitation = async (tid: string, uid: string) =>
  handleMutationResponse({
    response: await ppUpdateData({
      url: `thread/${tid}/managers/action`,
      uid,
      data: null,
    }),
    message: "Unable to accept manager invitation!",
  });

export const rejectManagerInvitation = async (tid: string, uid: string) =>
  handleMutationResponse({
    response: await ppDeleteData(`thread/${tid}/managers/action`, uid),
    message: "Unable to reject manager invitation!",
  });

export const sendMessage = async (
  uid: string,
  rmid: string,
  data: MessageSchemaType
) =>
  handleMutationResponse({
    response: await ppPostData({
      url: `room/${rmid}/message`,
      uid,
      data,
    }),
    message: "Unable to send messages!",
  });

export const createRoom = async (
  uid: string,
  rmid: string,
  data: RoomSchemaType
) =>
  handleMutationResponse({
    response: await ppPostData({
      url: `room/${rmid}`,
      uid,
      data,
    }),
    message: "Unable to create room!",
  });

export const acceptRoomInvitation = async (uid: string, rmid: string) =>
  handleMutationResponse({
    response: await ppPostData({
      url: `room/${rmid}/invitation`,
      uid,
    }),
    message: "Unable to accept invitation!",
  });

export const rejectRoomInvitation = async (uid: string, rmid: string) =>
  handleMutationResponse({
    response: await ppDeleteData(`room/${rmid}/participant`, uid),
    message: "Unable to reject invitation!",
  });

export const leaveRoom = async (uid: string, rmid: string) =>
  handleMutationResponse({
    response: await ppDeleteData(`room/${rmid}/participant`, uid),
    message: "Unable to leave room!",
  });

export const updateParticipantSeenAt = async (rmid: string, uid: string) =>
  handleMutationResponse({
    response: await ppUpdateData({ url: `room/${rmid}/participant`, uid, data: null })
  });

export const unsendMessage = async (rmid: string, msgid: string, uid: string) =>
  handleMutationResponse({
    response: await ppDeleteData(`room/${rmid}/message/${msgid}`, uid),
    message: "Unable to unsend message!",
  });

export const actionOnReportedContents = async (tid: string, uid: string, data: ReportActionSchemaType) =>
  handleMutationResponse({
    response: await ppUpdateData({
      url: `report/${tid}`,
      uid,
      data,
    }),
    message: "Unable to save decisions!",
  });
