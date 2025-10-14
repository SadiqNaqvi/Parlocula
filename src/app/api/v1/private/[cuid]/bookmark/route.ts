import { postRequest } from "@lib/helpers/common";
import { bookmarkSchema } from "@lib/schemas";
import { ObjectId } from "@lib/utils";
import { Bookmark, Comment, Follow, List, Post } from "@model";
import { bookmarkSchemaType } from "@type/schemas";

// Checking if the current user has been blocked by the author of the content.
const preCheck = async ({ user_id, data }: { user_id: string; data: any }) => {
  const { content_author } = data;

  const isBlocked = await Follow.exists({
    follower: ObjectId(user_id),
    followee: ObjectId(content_author),
    blocked: true,
  });

  if (isBlocked) return { success: false, errCode: "blocked_by_author" };

  return { success: true };
};

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

// Save an item. It could be a post, a comment or a list.
export const POST = postRequest({
  handler: async ({ data, user_id, session }) => {
    const { content_id, content_type } = data as bookmarkSchemaType;

    await Bookmark.create({ ...data, user_id }, { session });

    const Model = getModel(content_type);

    if (Model)
      await Model.findOneAndUpdate(
        { _id: ObjectId(content_id) },
        { $inc: { saved_count: 1 } },
        { session }
      );

    return {
      success: true,
      result: null,
      available: `saved${content_type}s_uid`,
      options: { uid: user_id },
    };
  },
  schema: bookmarkSchema,
  preCheck,
});
