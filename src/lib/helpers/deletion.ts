import { Bookmark, Comment, Follow, Item, List, Post, Reaction, Vote } from "@model";
import Message from "@model/messages";
import Participant from "@model/participants";
import Room from "@model/rooms";
import { BookmarkModelType, CommentModelType, ListModelType, PostModelType, RoomModelType } from "@type/models";
import { ClientSession } from "mongoose";
import { deleteMultipleMedia } from "./server";
import { GenericDate } from "@type/internal";

type Doc = { _id: string };

type func<M, K extends keyof M = keyof M> = (filter: Partial<Record<K, any>>, session: ClientSession) => Promise<any[]>;

export const deleteBookmarks: func<BookmarkModelType> = async (filter, session) => {
  await Bookmark.deleteMany(filter, { session });
  return [];
};

export const deleteLists: func<ListModelType> = async (filter, session) => {
  const lists: Doc[] = await List.find(filter, { _id: 1 }, { session });

  if (!lists.length) return lists;

  const ids = lists.map((el) => el._id);

  Item.deleteMany({ list_id: { $in: ids } }, { session });

  deleteBookmarks({ content_type: "List", content_id: { $in: ids } }, session);

  List.deleteMany(filter, { session });
  return lists;
};

export const deleteComments: func<CommentModelType> = async (filter, session) => {
  const comments: Doc[] = await Comment.find(filter, { _id: 1 }, { session });

  if (!comments.length) return comments;

  const ids = comments.map((el) => el._id);

  Vote.deleteMany({ _id: { $in: ids } }), { session };

  deleteBookmarks(
    { content_type: "Comment", content_id: { $in: ids } },
    session
  );

  Comment.deleteMany(filter, { session });
  return comments;
};

export const deletePosts: func<PostModelType> = async (filter, session) => {
  type Post = Doc & { frames: { path: string; type: "image" | "video" }[] };

  const posts: Post[] = await Post.find(
    filter,
    { frames: 1 },
    { session, ordered: true }
  );

  if (!posts.length) return posts;

  const paths = posts.flatMap((post) =>
    post.frames
      .filter((frame) => !frame.path.includes("https"))
      .map(({ path, type }) => ({ path, type }))
  );

  deleteMultipleMedia(paths);

  const ids = posts.map((el) => el._id);

  Reaction.deleteMany({ post_id: { $in: ids } }, { session, ordered: true });

  deleteComments({ post_id: { $in: ids } }, session);

  deleteBookmarks({ content_type: "Post", content_id: { $in: ids } }, session);

  Post.deleteMany(filter, { session, ordered: true });
  return posts;
};

export const deleteRoom: func<RoomModelType> = async (filter, session) => {

  const rooms = await Room.find(filter);

  for (const r of rooms) {
    const room = r.toObject();
    if (!room) continue;

    await Room.findByIdAndDelete(room._id, { session });
    await Participant.deleteMany({ room_id: room._id }, { session });
    await Message.deleteMany({ room_id: room._id }, { session });
  }

  return rooms;

};

export const timeBasedReversion = async (user_id: string, date: GenericDate, session: ClientSession) => {

  const createdAtFilter = { $gt: new Date(date) };

  const filter = {
    user_id,
    createdAt: createdAtFilter,
  }

  await deletePosts(filter, session);

  await deleteComments(filter, session);

  await deleteBookmarks(filter, session);

  await deleteLists(filter, session);

  await Participant.deleteMany(filter, { session });

  await Message.deleteMany(filter, { session });

  await Follow.deleteMany({ follower: user_id, createdAt: createdAtFilter }, { session });

  await Reaction.deleteMany(filter, { session });

  await Vote.deleteMany(filter, { session })
}