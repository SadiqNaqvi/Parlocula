import { BookmarkIcon, ChartIcon, CommentIcon, Ellipsis, ShareIcon, ThumbUpIcon } from "@assets/Icons";
import placeholder from "@assets/placeholder.png";
import { getInternalPoster, getThumbnail, numberConverter, timeAgo } from "@lib/utils";
import Image from "next/image";

type PostType = {
    upvotes: number,
    views: number,
    comments: number,
    _id: string,
    thread_id: string,
    user_id: string,
    post_id: {
        _id: string,
        title: string,
        body: string,
        media: string,
        media_type: string,
        createdAt: Date,
    }
}

const image_options = {
    height: 192, width: 192, crop: "fill",
}

const refinePosts = (post: PostType) => {
    const { comments, post_id, upvotes, user_id, views } = post;
    const { _id, body, media, media_type, title, createdAt } = post_id;

    const thumbnail = media_type ? media_type === "image" ? getInternalPoster(media, image_options) : getThumbnail(media) : null

    return {
        _id,
        body,
        comments,
        createdAt,
        thumbnail,
        title,
        upvotes,
        user_id,
        views,
    }

}

export default function PostTile({ classnames = "", _id, comments, post_id, thread_id, upvotes, user_id, views }: { classnames?: string } & PostType) {

    const content = refinePosts({ _id, comments, post_id, thread_id, upvotes, user_id, views });

    return (
        <article className={`w-full space-y-5 py-5 ${classnames}`}>
            <section className="flex flex-cntr-between">
                <div className="flex gap-2">
                    <Image src={placeholder} loading="lazy" className="size-10 inline object-cover rounded-full" height={50} width={50} alt="" />
                    <div>
                        <h3 className="line-clamp-1">Lorem ipsum dolor sit amet.</h3>
                        <p className="text-sm text-zinc-500">{timeAgo(new Date(content.createdAt).getTime())}</p>
                    </div>
                </div>
                <div>
                    <button className="smallBtn border-0"><Ellipsis /></button>
                </div>
            </section>
            <section className="flex gap-2">
                <Image src={content.thumbnail || placeholder} loading="lazy" className="size-48 min-w-48" height={300} width={300} alt="" />
                <div>
                    <h3 className="text-2xl font-semibold line-clamp-2">{content.title}</h3>
                    <p className="line-clamp-4 mt-4">{content.body}</p>
                </div>
            </section>
            <section className="flex flex-cntr-between">
                <div className="space-x-2">
                    <span className="text-sm p-2 hover:bg-opacity-30 hover:bg-gray-500 rounded-md">
                        <ThumbUpIcon classnames="inline mr-1 h-4 align-top" />
                        {upvotes && numberConverter(upvotes)}
                    </span>
                    <span className="text-sm p-2 hover:bg-opacity-30 hover:bg-gray-500 rounded-md">
                        <CommentIcon classnames="inline mr-1 h-4 align-top" />
                        {comments && numberConverter(comments)}
                        4.3K
                    </span>
                    <span className="text-sm p-2 hover:bg-opacity-30 hover:bg-gray-500 rounded-md">
                        <ChartIcon classnames="inline mr-1 h-4 align-top" />
                        {views && numberConverter(views)}
                    </span>
                </div>
                <div className="space-x-6 *:border-0 *:inline">
                    <button className="smallBtn">
                        <ShareIcon />
                    </button>
                    <button className="smallBtn">
                        <BookmarkIcon />
                    </button>
                </div>
            </section>
        </article>
    )
}