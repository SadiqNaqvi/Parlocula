import { BookmarkIcon, CommentIcon, FrameIcon, LinkIcon, ThumbUpIcon } from "@assets/Icons";
import { FramesCarousel, Navigate } from "@components";
import { makeUrlSafe, numberConverter, timeAgo } from "@lib/utils";
import { MerePost } from "@type/internal";
import { BreadCrumbs, BreadCrumbTile, MetadataTile, MetadataTileContainer, ParloImage } from "./";
import FrameSlider from "@app/post/[id]/(WithHeader)/FrameSlider";

type SectionType = "thread" | "user";

type Props = { additional?: { section: SectionType } }

const PosterClassName = "object-cover min-w-10 max-w-10 max-h-10 size-10";
const containerClassName = "rounded-full overflow-hidden";
const fallbackClassName = "size-6"

const PostbarBreadCrumbs = ({ poster, profile, thread_id, thread_name, username, section }: Pick<MerePost, | "username" | "profile" | "poster" | "thread_name" | "thread_id"> & { section: SectionType | "all" }) => {

    if (!section || section === "all") return (
        <div className="flex gap-3 items-center">
            <Navigate comp="link" goto={`/user/${username}`}>
                <ParloImage
                    frameType="userProfile"
                    frame={profile}
                    className={PosterClassName}
                    containerClassName={containerClassName}
                    classNameForFallback={fallbackClassName}
                    size={40}
                    alt={`Profile picture of ${username} the author of this post`} />
            </Navigate>

            <BreadCrumbs>
                <BreadCrumbTile href={`/thread/${thread_id}`}>Thread</BreadCrumbTile>
                <BreadCrumbTile href={`/user/${username}`}>{username}</BreadCrumbTile>
            </BreadCrumbs>
        </div>
    )

    else if (section === "thread") return (
        <Navigate comp="link" goto={`/user/${username}`} className="flex gap-3 items-center">
            <ParloImage
                frameType="userProfile"
                frame={username ? profile : undefined}
                className={PosterClassName}
                containerClassName={containerClassName}
                classNameForFallback={fallbackClassName}
                size={40}
                alt={`Poster of the thread ${thread_name}`}
            />
            <span className="font-semibold">{username || "Not Found"}</span>
        </Navigate>
    )

    return (
        <Navigate comp="link" goto={`/thread/${thread_id}`} className="flex gap-3 items-center">
            <ParloImage
                frameType="threadPoster"
                frame={poster}
                className={PosterClassName}
                containerClassName={containerClassName}
                classNameForFallback={fallbackClassName}
                size={40}
                alt={`Poster of the thread ${thread_name}`}

            />
            <span className="font-semibold">{thread_name}</span>
        </Navigate>

    )

}

const PostBar = ({ _id, comment_count, nsfw, createdAt, editedAt, poster, reaction_count, frames_count, links_count, spoiler, category, thread_id, title, frames, saved_count, username, profile, thread_name, additional }: Props & MerePost) => {

    const statisticList = [
        { value: frames_count, Icon: FrameIcon },
        { value: links_count, Icon: LinkIcon },
        { value: reaction_count, Icon: ThumbUpIcon },
        { value: comment_count, Icon: CommentIcon },
        { value: saved_count, Icon: BookmarkIcon },
    ]

    return (
        <article className="px-2 py-4 space-y-4 w-full border-b group-last:border-0 border-gray10">

            <header className="space-y-2">
                <PostbarBreadCrumbs poster={poster} profile={profile} thread_id={thread_id} thread_name={thread_name} username={username} section={additional?.section || "all"} />
                <MetadataTileContainer>
                    <MetadataTile>{timeAgo(createdAt)}</MetadataTile>

                    <MetadataTile
                        condition={!!(category && category !== "none")}
                        href={`/thread/${thread_id}?c=${category}`}
                        className="capitalize">
                        {category}
                    </MetadataTile>

                    <MetadataTile className="px-2 py-1 bg-gray10 border-gray20 rounded-md" condition={Boolean(editedAt)}>Edited: {timeAgo(editedAt || 0)}</MetadataTile>

                    <MetadataTile nsfw condition={nsfw}>NSFW</MetadataTile>

                    <MetadataTile spoiler condition={spoiler}>Spoiler</MetadataTile>

                </MetadataTileContainer>
            </header>

            <section className="space-y-2 mb-4">

                <Navigate role="button" comp="link" goto={`/post/${_id}-${makeUrlSafe(title)}`} className="w-full">
                    <h3 className="customize text-lg font-semibold line-clamp-4">{title}</h3>
                </Navigate>

                <FrameSlider id={_id} frames={frames || []} />
            </section>

            <ul className="flex gap-3">
                {statisticList.map(({ Icon, value }, i) => (
                    <li key={i} className="flex items-center gap-1 text-zinc-500">
                        <Icon className="size-4" />
                        <span>{numberConverter(value || 0)}</span>
                    </li>
                ))}
            </ul>

        </article>
    )
}

export default PostBar;