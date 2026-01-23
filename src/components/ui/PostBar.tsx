import { BookmarkIcon, CommentIcon, FrameIcon, LinkIcon, RightChevron, ThumbUpIcon } from "@assets/Icons";
import { FramesCarousel, Navigate } from "@components";
import { makeUrlSafe, numberConverter, timeAgo } from "@lib/utils";
import { MerePost } from "@type/internal";
import ParloImage from "./ParloImage";
import MetadataTile from "./MetaDataTile";
import { BreadCrumbs, BreadCrumbTile } from "./Breadcrumbs";

type SectionType = "thread" | "user";

type Props = { additional?: { section: SectionType } }

const PostBarHeader = ({ poster, profile, thread_id, thread_name, username, section }: Pick<MerePost, | "username" | "profile" | "poster" | "thread_name" | "thread_id"> & { section: SectionType | "all" }) => {

    if (!section || section === "all") return (
        <div className="flex gap-3 items-center">
            <Navigate comp="link" goto={`/user/${username}`}>
                <ParloImage
                    frame={profile}
                    className="inline object-cover rounded-full size-[40px]"
                    size={40}
                    alt="Profile picture of the author of this post" />
            </Navigate>

            <div className="flex gap-2 items-center">
                <BreadCrumbs>
                    <BreadCrumbTile href={`/thread/${thread_id}`}>Thread</BreadCrumbTile>
                    <BreadCrumbTile href={`/user/${username}`}>{username}</BreadCrumbTile>
                </BreadCrumbs>
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
                <PostBarHeader poster={poster} profile={profile} thread_id={thread_id} thread_name={thread_name} username={username} section={additional?.section || "all"} />
                <MetadataTile
                    others={[
                        { value: category, className: "bg-gray10 px-3 py-1 color-primary" }
                    ]}
                    nsfw={nsfw}
                    spoiler={spoiler}
                    createdAt={createdAt}
                    editedAt={editedAt || undefined}
                />
            </header>

            <section className="flex gap-2 flex-col sm:flex-row-reverse">

                <Navigate role="button" comp="link" goto={`/post/${_id}-${makeUrlSafe(title)}`} className="w-full">
                    <h3 className="customize text-lg font-semibold line-clamp-4">{title}</h3>
                </Navigate>

                <FramesCarousel gallery={_id} className="w-full sm:w-80" frames={frames || []} />
            </section>

            <ul className="flex gap-3">
                {statisticList.map(({ Icon, value }, i) => (
                    <li key={i} className="flex items-center gap-1 text-zinc-500">
                        <Icon className="size-4" />
                        <span>{numberConverter(value || 0)}</span>
                    </li>
                ))}
                <i className="fa-light fa-link"></i>
            </ul>

        </article>
    )
}

export default PostBar;