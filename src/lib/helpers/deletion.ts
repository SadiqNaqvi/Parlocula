import { deleteMediaFiles } from "@lib/providers/media";
import { Bookmark, Comment, Like, Message, Participant, Post, Reaction, Room, Shelf, ShelfItem, User } from "@model";
import { BookmarkModelType, CommentModelType, PostModelType, RoomModelType, ShelfModelType } from "@type/models";
import { ClientSession, FilterQuery } from "mongoose";

type Doc = { _id: string };

export const deleteBookmarks = async (filter: FilterQuery<BookmarkModelType & Doc>, session: ClientSession): Promise<BookmarkModelType[]> => {
  await Bookmark.deleteMany(filter, { session });
  return [];
};

export const deleteShelfs = async (filter: FilterQuery<ShelfModelType & Doc>, session: ClientSession): Promise<ShelfModelType[]> => {
  const shelfs = await Shelf.find(filter, { session })
    .exec();

  if (!shelfs.length) return shelfs;

  const ids = shelfs.map((el) => el._id);

  ShelfItem.deleteMany({ shelf_id: { $in: ids } }, { session });

  deleteBookmarks({ content_type: "Shelf", content_id: { $in: ids } }, session);

  Shelf.deleteMany(filter, { session });
  return shelfs;
};

export const deleteComments = async (filter: FilterQuery<CommentModelType & Doc>, session: ClientSession): Promise<CommentModelType[]> => {
  const comments = await Comment.find(filter, { _id: 1 }, { session });

  if (!comments.length) return comments;

  const ids = comments.map((el) => el._id);

  Like.deleteMany({ _id: { $in: ids } }), { session };

  deleteBookmarks(
    { content_type: "Comment", content_id: { $in: ids } },
    session
  );

  Comment.deleteMany(filter, { session });
  return comments;
};

export const deletePosts = async (filter: FilterQuery<PostModelType & Doc>, session: ClientSession): Promise<PostModelType[]> => {

  const posts = await Post.find(
    filter,
    { session, ordered: true }
  );

  if (!posts.length) return posts;

  const paths = posts.flatMap((post) =>
    post.frames
      .filter((frame) => !frame.isExternal)
      .map((path) => path.path)
  );

  deleteMediaFiles(paths);

  const ids = posts.map((el) => el._id);

  Reaction.deleteMany({ post_id: { $in: ids } }, { session, ordered: true });

  deleteComments({ post_id: { $in: ids } }, session);

  deleteBookmarks({ content_type: "Post", content_id: { $in: ids } }, session);

  Post.deleteMany(filter, { session, ordered: true });

  return posts;
};

export const deleteRooms = async (filter: FilterQuery<RoomModelType & Doc>, session: ClientSession): Promise<RoomModelType[]> => {

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

export const deleteUser = async (user_id: string, session: ClientSession, profile: string | undefined) => {

  await deleteBookmarks({ user_id }, session);

  await deleteShelfs({ user_id }, session);

  const rooms = await Room.find({ user_id });

  for (const r of rooms) {
    const room = r.toObject();
    if (!room) continue;

    if (room.type === "private") {
      // If room is a private room, then delete the room as well as all the participants in it.

      await Room.findByIdAndDelete(room._id, { session });
      await Message.deleteMany({ room_id: room._id }, { session });
      await Participant.deleteMany({ room_id: room._id }, { session });
    } else {
      // If room is not a private room, then delete the participant only
      await Participant.deleteOne({ user_id, room_id: room._id }, { session });
    }
  }

  if (profile) deleteMediaFiles(profile);

  await User.findByIdAndDelete(user_id, { session });

}

// A feature for future.
/*
export const timeBasedReversion = async (user_id: string, date: GenericDate, session: ClientSession) => {

  const createdAtFilter = { $gt: new Date(date) };

  const filter = {
    user_id,
    createdAt: createdAtFilter,
  }

  await deletePosts(filter, session);

  await deleteComments(filter, session);

  await deleteBookmarks(filter, session);

  await deleteShelfs(filter, session);

  await Participant.deleteMany(filter, { session });

  await Message.deleteMany(filter, { session });

  await Connection.deleteMany({ follower: user_id, createdAt: createdAtFilter }, { session });

  await Reaction.deleteMany(filter, { session });

  await Like.deleteMany(filter, { session })
}
  */