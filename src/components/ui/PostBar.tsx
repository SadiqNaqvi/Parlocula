import { BookmarkIcon, CommentIcon, LinkIcon, RightChevron, ThumbUpIcon } from "@assets/Icons";
import { Navigate, FramesCarousel } from "@components";
import { getPoster, numberConverter, makeUrlSafe, timeAgo } from "@lib/utils";
import { MerePost } from "@type/internal";
import Image from "next/image";
import ParloImage from "./ParloImage";

type SectionType = "thread" | "user";

type Props = { additional?: { section: SectionType } }

const PostBarHeader = ({ poster, profile, thread_id, thread_name, username, section }: Pick<MerePost, | "username" | "profile" | "poster" | "thread_name" | "thread_id"> & { section: SectionType | "all" }) => {

    if (!section || section === "all") return (
        <div className="flex gap-3 items-center">
            <Navigate comp="link" goto={`/user/${username}`}>
                <ParloImage
                    frame={profile}
                    className="inline object-cover rounded-full"
                    size={40}
                    alt="Profile picture of the author of this post" />
            </Navigate>

            <div className="flex gap-2 items-center">
                <Navigate comp="link" goto={`/thread/${thread_id}`} className="flex gap-2">
                    <span>{thread_name}</span>
                    <RightChevron className="size-2" />
                </Navigate>
                <Navigate comp="link" goto={`/user/${username}`} className="flex gap-2">
                    <span>{username}</span>
                    <RightChevron className="size-2" />
                </Navigate>
            </div>
        </div>
    )

    else if (section === "thread") return (
        <Navigate comp="link" goto={`/user/${username}`} className="flex gap-3 items-center">
            <ParloImage
                frame={username ? profile : undefined}
                className="inline object-cover rounded-full"
                size={40}
                alt="Profile picture of the author of this post"
            />
            <span className="font-semibold">{username || "Not Found"}</span>
        </Navigate>
    )

    return (
        <Navigate comp="link" goto={`/thread/${thread_id}`} className="flex gap-3 items-center">
            <ParloImage
                frame={poster}
                className="inline object-cover rounded-full"
                size={40}
                alt="Profile picture of the author of this post"
            />
            <span className="font-semibold">{thread_name}</span>
        </Navigate>

    )

}

const PostBar = ({ _id, comment_count, nsfw, createdAt, editedAt, poster, reaction_count, frames_count, links_count, spoiler, category, thread_id, title, frames, saved_count, username, profile, thread_name, additional }: Props & MerePost) => {

    return (
        <article className="p-2 w-full space-y-3 border-b border-gray40">

            <header className="space-y-3">
                <PostBarHeader poster={poster} profile={profile} thread_id={thread_id} thread_name={thread_name} username={username} section={additional?.section || "all"} />
                <ul className="flex gap-2 text-sm text-zinc-500">
                    <li>{timeAgo(createdAt)}</li>
                    {editedAt && (<li>Edited: {timeAgo(editedAt)}</li>)}
                </ul>
            </header>

            <section className="flex gap-4 my-2 flex-col sm:flex-row-reverse">

                <Navigate role="button" comp="link" goto={`/post/${_id}-${makeUrlSafe(title)}`} className="w-full">
                    <ul className="flex gap-3">
                        {category && (
                            <li className="bg-gray10 rounded-md px-3 py-1 text-xs capitalize">{category}</li>
                        )}
                        {nsfw && (
                            <li className="bg-violet-500 bg-opacity-30 rounded-md text-xs px-3 py-1">NSFW</li>
                        )}
                        {spoiler && (
                            <li className="bg-orange-500 bg-opacity-30 rounded-md px-3 py-1 text-xs">SPOILER</li>
                        )}
                    </ul>

                    <div className="flex gap-2 my-3">
                        <h3 className="text-lg font-semibold line-clamp-4">{title}</h3>
                    </div>
                </Navigate>

                <FramesCarousel className="w-full sm:w-80" frames={frames || []} />
            </section>

            <section>
                <div className="space-x-2 text-sm text-zinc-500 inline mr-4">
                    <div>Frames: {frames_count || 0}</div>
                    <div className="space-x-2">
                        <LinkIcon className="size-4" />
                        <span>{links_count || 0}</span>
                    </div>
                </div>
                <div className="space-x-2 text-sm text-zinc-500 inline ">

                    <div className="space-x-1">
                        <ThumbUpIcon className="size-4" />
                        <span>{numberConverter(reaction_count)}</span>
                    </div>

                    <div className="space-x-1">
                        <CommentIcon className="size-4" />
                        <span>{numberConverter(comment_count)}</span>
                    </div>

                    <div className="spaxe-x-1">
                        <BookmarkIcon className="size-4" />
                        <span>{saved_count}</span>
                    </div>
                </div>
            </section>

        </article>
    )
}

export default PostBar;