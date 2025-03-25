import { getRequest } from "@lib/actions/actions";
import { ObjectId } from "@lib/utils";
import { Comment } from "@model";

export const GET = getRequest(async (r: any, params: { id: string }) => {
  const { id } = params;

  const comment = await Comment.findOne({
    _id: ObjectId(id),
  })
    .populate("user_id", "username profile -_id")
    .select("-user_id");

  return { result: comment, success: true, errCode: null };
});
