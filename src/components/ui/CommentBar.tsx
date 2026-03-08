import { BookmarkIcon, ThumbUpIcon } from "@assets/Icons";
import { Navigate } from "@components";
import { numberConverter, timeAgo } from "@lib/utils";
import useGlobalStore from "@store/globalStore";
import { CommentReplyType, CurrentUser, MereComment } from "@type/internal";
import Image from "next/image";
import ParloImage from "./ParloImage";
import OptionalChildren from "./OptionalChildren";
import MetadataTile, { MetadataTileContainer } from "./MetaDataTile";

type LinkProps = {
    children: React.ReactNode,
    link: string,
    className?: string,
    status: "sending" | "sent" | undefined,
}

const Link = ({ children, link, className, status }: LinkProps) => (
    <OptionalChildren condition={status !== "sending"} fallback={<div>{children}</div>}>
        <Navigate className={className} comp="link" goto={link}>{children}</Navigate>
    </OptionalChildren>
)

type Props = MereComment & {
    user: CurrentUser,
    restrictReply?: boolean
}

type ParentCommentType = (CommentReplyType & { replied_to: string | undefined });

const ParentCommentBar = ({ parentComment }: { parentComment: ParentCommentType | undefined }) => {

    if (!parentComment || !parentComment.replied_to || !(parentComment.attachment || parentComment.content)) return null;

    const { replied_to, content, attachment } = parentComment;

    if (!content && attachment) return (
        <Navigate
            className="p-2 border border-gray20 rounded-md w-full"
            comp="link" type="button" goto={`/comment/${replied_to}`}>
            <div className="space-y-3">
                <Image
                    height={24}
                    width={24}
                    alt="GIF attached with the comment"
                    src={attachment}
                    className="object-contain size-6 rounded-md"
                />
            </div>
        </Navigate>
    )

    else if (content)
        return (
            <Navigate
                className="p-2 border border-gray20 rounded-md w-full"
                comp="link" type="button" goto={`/comment/${replied_to}`}>
                <div className="space-y-3">
                    <p className="text-sm line-clamp-2">{content}</p>
                </div>
            </Navigate>
        )

}

const CommentBar = ({ _id, attachment, nsfw, spoiler, post_id, user, content, status, saved_count, likes_count, profile, parentComment, replied_to, username, createdAt, edited_at, restrictReply }: Props) => {

    const [, setReply] = useGlobalStore<ParentCommentType | undefined>(`reply:post:${post_id}`, undefined);

    const handleReply = () => {
        if (user && status !== "sending" && !restrictReply)
            setReply({
                content: content,
                replied_to: _id,
                attachment,
            })
    }

    return (
        <article className="w-full my-2 group-last:border-0 border border-gray30">

            <ParentCommentBar parentComment={parentComment ? { ...parentComment, replied_to } : undefined} />

            <details className="w-full p-2 border-l border-gray30" open={!Boolean(nsfw || spoiler)}>

                <summary className="flex gap-3 items-center">

                    <ParloImage
                        frameType="userProfile"
                        frame={profile}
                        className="min-w-8 size-8 rounded-full object-cover"
                        size={32}
                        alt={`profile picture of ${username}`}
                    />

                    <OptionalChildren condition={username} fallback={(
                        <span className="text-gray-500 font-semibold">[deleted]</span>
                    )}>
                        <Navigate comp="link" role="button" goto={`/user/${username}`} className="font-semibold">{username}</Navigate>
                    </OptionalChildren>

                    <MetadataTileContainer>
                        <MetadataTile>{timeAgo(createdAt)}</MetadataTile>

                        <MetadataTile condition={!!edited_at}>Edited</MetadataTile>

                        <MetadataTile condition={nsfw} nsfw>NSFW</MetadataTile>
                        <MetadataTile condition={spoiler} spoiler>Spoiler</MetadataTile>

                    </MetadataTileContainer>
                </summary>

                <div className="my-2 space-y-4">
                    <Link status={status} link={`/comment/${_id}`} className="space-y-4 my-2">
                        <p className="text-sm">{content}</p>
                        <OptionalChildren condition={attachment}>
                            <Image
                                src={attachment}
                                alt="Attachment"
                                className="size-12 rounded-md border border-gray30 object-contain"
                                height={48}
                                width={48}
                            />
                        </OptionalChildren>
                    </Link>

                    <section className="flex mt-2 gap-3">

                        <span className="flex gap-1 text-gray-500">
                            <ThumbUpIcon className="h-4" />
                            {numberConverter(likes_count)}
                        </span>

                        <span className="flex gap-1 text-gray-500">
                            <BookmarkIcon className="h-4" />
                            {numberConverter(saved_count)}
                        </span>

                        <OptionalChildren condition={status !== "sending"} fallback={<span>Sending...</span>}>
                            <OptionalChildren condition={!restrictReply}>
                                <button className="smallBtn my-auto border-0" onClick={handleReply}>Reply</button>
                            </OptionalChildren>
                        </OptionalChildren>
                    </section>
                </div>
            </details>
        </article>
    )

}

export const CommentBarWithoutReply = (comment: Omit<Props, "restrictReply">) => (
    <CommentBar {...comment} restrictReply={true} />
);

export default CommentBar;