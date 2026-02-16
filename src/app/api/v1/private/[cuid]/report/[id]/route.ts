import { getHandler, postHandler, updateHandler } from "@lib/helpers/handlers";
import { sendNotification } from "@lib/helpers/server";
import { reportActionSchema } from "@lib/schemas";
import { capitalize } from "@lib/utils";
import { Comment, Member, Post } from "@model";
import Report from "@model/reports";
import { ReportActionSchemaType, ReportSchemaType } from "@type/schemas";

// Check if the content is reported by the current user and return report's metadata.
// Here id is content_id
export const GET = getHandler(async (r, params) => {

  const search = r.nextUrl.searchParams;
  const ctype = search.get("type")?.toLowerCase();
  const { id } = params;

  if (!ctype || !["comment", "post", "thread", "user"].includes(ctype)) return {
    success: false,
    errCode: "invalid_input",
    customError: "Invalid content type",
  };

  const result = await Report.findOne({
    user_id: params.cuid,
    content_type: capitalize(ctype),
    content_id: id,
  }).exec();

  return { success: true, result };
});

// Creating a new report
export const POST = postHandler<ReportSchemaType>({
  handler: async ({ data, user_id }) => {

    await Report.create([{ ...data, user_id }]);

    return {
      success: true,
      result: null,
      revalidateQueue: [],
    };
  },
});

type PipelineProp = {
  contentsToDelete: string[],
  contentsToWarnAuthor: string[],
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
export const PATCH = updateHandler<ReportActionSchemaType>({
  handler: async ({ data, user_id, session }) => {

    const { actions, type } = data;
    let contentsToDelete: string[] = [];
    let contentsToKeep: string[] = [];
    let contentsToWarnAuthor: string[] = [];

    actions.forEach(action => {
      if (action.action === "delete") {
        contentsToDelete.push(action.id);
      }
      else if (action.action === "keep") {
        contentsToKeep.push(action.id);
      } else contentsToWarnAuthor.push(action.id)
    });

    await Report.deleteMany({
      content_id: { $in: contentsToDelete.concat(contentsToKeep) }
    }, { session });

    const payload = {
      _id: { $in: contentsToDelete }
    }

    if (type === "post") {
      await Post.deleteMany(payload, { session });
    } else {
      await Comment.deleteMany(payload, { session });
    }

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

    // Sending notifications to the author of the content whose post/comment has been deleted
    await sendNotification(
      forDeletion.map(content => {
        const content_title = type === "post" ? content.title : content.content;
        return {
          title: `Your ${type} has been deleted.`,
          poster: undefined,
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

    // Sending Wanrning to the author of the post/comment.
    await sendNotification(
      forWarning.map(content => {

        const content_title = type === "post" ? content.title : content.content;
        const path = `/${type}/${content._id}/reports`;

        return {
          title: `Immediate Action Required.`,
          poster: undefined,
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
        .map(el => `notifications-user-${el.user_id}`)
        .concat(contentsToKeep.map(el => `reports-${el}`)),
    }
  },

  preCheck: async ({ params, user_id }) => {
    const isManager = await Member.exists({
      thread_id: params.id,
      user_id,
      role: { $in: ["creator", "moderator"] }
    });

    if (isManager) return { success: true }
    return { success: false, errCode: "unauthorized_access" }
  },
  schema: reportActionSchema,
});