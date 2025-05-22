import { Bookmark, Comment, Item, List, Post, Reaction, Vote } from "@model";
import { ClientSession } from "mongoose";
import { deleteMultipleMedia } from "./server";

type Doc = { _id: string };

type func = (filter: any, session: ClientSession) => Promise<any[]>;

export const deleteBookmarks: func = async (filter, session) => {
  await Bookmark.deleteMany(filter, { session });
  return [];
};

export const deleteLists: func = async (filter, session) => {
  const lists: Doc[] = await List.find(filter, { _id: 1 }, { session });

  if (!lists.length) return lists;

  const ids = lists.map((el) => el._id);

  Item.deleteMany({ list_id: { $in: ids } }, { session });

  deleteBookmarks({ content_type: "List", content_id: { $in: ids } }, session);

  List.deleteMany(filter, { session });
  return lists;
};

export const deleteComments: func = async (filter, session) => {
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

export const deletePosts: func = async (filter, session) => {
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
