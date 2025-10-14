import { getRequest, updateRequest } from "@lib/helpers/common";
import { sendNotification } from "@lib/helpers/server";
import { reportAggregationPipeline } from "@lib/pipelines";
import { reportActionSchema } from "@lib/schemas";
import { getPageParams, ObjectId } from "@lib/utils";
import { Comment, Member, Post } from "@model";
import Report from "@model/reports";
import { ReportActionSchemaType } from "@type/schemas";
import { Model, Types } from "mongoose";

// Reports on the Thread. Should only be see my the mods (creator and managers)
// Here id is thread id.
export const GET = getRequest(async (r, params) => {
  const { id, cuid } = params;
  const page = getPageParams(r);

  const isManager = await Member.exists({
    user_id: ObjectId(cuid),
    thread_id: ObjectId(id),
    role: { $or: ["moderator", "creator"] }
  });

  if (!isManager) return { success: false, errCode: "unauthorized_access" }

  const response = await Report.aggregate(
    reportAggregationPipeline({
      content_id: id,
      page,
      isThread: true,
    })
  );

  return { success: true, result: response ?? [] };
});

type PipelineProp = {
  contentsToDelete: Types.ObjectId[],
  contentsToWarnAuthor: Types.ObjectId[],
  type: "post" | "comment",
  key: "title" | "content"
}

type Content = { _id: string, user_id: string, title: string, content: string };
type PipelineResult = {
  forDeletion: Content[]
  forWarning: Content[]
}

const getContents = async ({ contentsToDelete, contentsToWarnAuthor, type, key }: PipelineProp) => {
  const Model = type === "post" ? Post : Comment;
  const result = await Model.aggregate<PipelineResult>([
    {
      $facet: {
        postsToDelete: [
          { $match: { _id: { $in: contentsToDelete } } },
          {
            $project: {
              _id: 1,
              [key]: 1,
              user_id: 1,
            }
          }
        ],
        contentForWarning: [
          { $match: { _id: { $in: contentsToWarnAuthor } } },
          {
            $project: {
              _id: 1,
              [key]: 1,
              user_id: 1,
            }
          }
        ]
      }
    }
  ]);

  return result[0]
}

// Actions taken by Managers on reported contents.
export const PATCH = updateRequest<ReportActionSchemaType>({
  handler: async ({ data, user_id, session }) => {

    const { actions, type } = data;
    let contentsToDelete: Types.ObjectId[] = []
    let contentsToKeep: Types.ObjectId[] = []
    let contentsToWarnAuthor: Types.ObjectId[] = []

    actions.forEach(action => {
      if (action.action === "delete")
        contentsToDelete.push(ObjectId(action.id));
      else if (action.action === "keep")
        contentsToKeep.push(ObjectId(action.id));
      else contentsToWarnAuthor.push(ObjectId(action.id))
    });

    await Report.deleteMany({
      content_id: { $in: contentsToDelete.concat(contentsToKeep) }
    }, { session });

    const ContentModel: Model<any> = type === "post" ? Post : Comment;

    await ContentModel.deleteMany({
      _id: { $in: contentsToDelete }
    }, { session });

    const { forDeletion, forWarning } = await getContents({
      type,
      contentsToDelete,
      contentsToWarnAuthor,
      key: type === "post" ? "title" : "content"
    });

    await Member.findOneAndUpdate(
      { user_id },
      {
        $inc: {
          actionsTaken: contentsToDelete.length + contentsToKeep.length
        }
      },
      { session }
    )

    await sendNotification(
      forDeletion.map(content => {
        const content_title = type === "post" ? content.title : content.content;
        return {
          title: `Your ${type} has been deleted.`,
          message: [
            {
              type: "text",
              text: `Your ${type} 
              '${content_title.slice(0, 50).concat(content_title.length > 50 ? "..." : '')}' 
              has been deleted because of the reports on it.`
            },
          ],
          user_id: content.user_id,
        }
      }),
      session
    );

    await sendNotification(
      forWarning.map(content => {
        const content_title = type === "post" ? content.title : content.content;
        const path = `/${type.charAt(0)}/${content._id}/reports`
        return {
          title: `Immediate Action Required.`,
          message: [
            { type: "text", text: `You are being warned because your ${type}` },
            {
              type: "link",
              label: `${content_title.slice(0, 50).concat(content_title.length > 50 ? "..." : '')}`,
              path
            },
            {
              type: "text", text: `has been reported multiple times. Please update your ${type} accordingly or actions will be taken against it.`
            },
          ],
          user_id: content.user_id,
          path,
        }
      }),
      session,
    )

    return {
      success: true,
      result: null,
      revalidateQueue: forWarning
        .concat(forDeletion)
        .map(el => `notifications-user-${el.user_id}-page-1`)
        .concat(contentsToKeep.map(el => `reports-${el.toString()}`)),
    }
  },
  preCheck: async ({ params, user_id }) => {
    const isManager = await Member.exists({
      thread_id: params.id,
      user_id,
      role: { $or: ["creator", "moderator"] }
    });

    if (isManager) return { success: true }
    return { success: false, errCode: "unauthorized_access" }
  },
  schema: reportActionSchema,
});