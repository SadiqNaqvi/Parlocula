import { deleteRequest, getRequest } from "@lib/helpers/common";
import { ObjectId } from "@lib/utils";
import { Bookmark, Comment, List, Post } from "@model";

// To check if a content is saved by the current user.
export const GET = getRequest(
  async (_, params: { id: string; cuid: string }) => {
    const { id, cuid } = params;

    const isSaved = await Bookmark.exists({
      content_id: ObjectId(id),
      user_id: cuid,
    });

    return { success: true, result: Boolean(isSaved) };
  }
);

const getModel = (content_type: "List" | "Post" | "Comment") => {
  switch (content_type) {
    case "List":
      return List;
    case "Comment":
      return Comment;
    case "Post":
      return Post;
    default:
      undefined;
  }
};

// Unsave content
export const DELETE = deleteRequest(async ({ params, session, user_id }) => {
  const { id } = params;
  const doc = await Bookmark.findOneAndDelete({ content_id: id, user_id });

  const Model = getModel(doc?.content_type);

  if (Model && doc)
    await Model.findOneAndUpdate(
      { _id: ObjectId(doc.content_id) },
      { $inc: { saved_count: -1 } },
      { session }
    );

  return {
    success: true,
    result: null,
    available: "isSaved_uid_id",
    options: { uid: user_id, id },
    files: [],
  };
});
