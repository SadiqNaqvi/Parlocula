import { BookmarkIcon, ThumbUpIcon } from "@assets/Icons";
import { Navigate, NavigateComponentProps } from "@components";
import { numberConverter, timeAgo } from "@lib/utils";
import useGlobalStore from "@store/globalStore";
import { CurrentUser, MereComment } from "@type/internal";
import Image from "next/image";
import { ParloImage, OptionalChildren, MetadataTileContainer, MetadataTile } from "./";
import { ReplyInputType } from "@type/schemas";

type LinkProps = {
    children: React.ReactNode,
    link: string,
    className?: string,
    status: "sending" | "sent" | undefined,
} & Partial<NavigateComponentProps>

const Link = ({ children, link, className, status, ...args }: LinkProps) => (
    <OptionalChildren condition={status !== "sending"} fallback={<div>{children}</div>}>
        <Navigate
            {...args}
            className={className}
            comp="link"
            goto={link}
        >
            {children}
        </Navigate>
    </OptionalChildren>
)

type Props = MereComment & {
    user: CurrentUser,
    restrictReply?: boolean
}

const ParentCommentBar = ({ parentComment }: { parentComment: ReplyInputType | undefined }) => {

    if (!parentComment || !parentComment.replied_to || !(parentComment.attachment || parentComment.content)) return null;

    const { replied_to, content, attachment } = parentComment;

    if (!content && attachment) return (
        <Navigate
            className="block my-1 p-2 border border-gray20 rounded-md w-full"
            comp="link" type="button" goto={`/comment/${replied_to}`}>
            <p className="mb-1 text-xs sm:text-sm text-zinc-500">Replied to:</p>
            <div className="w-full">
                <Image
                    height={48}
                    width={48}
                    alt="GIF attached with the comment"
                    src={attachment}
                    unoptimized
                    className="object-contain size-12 rounded-md"
                />
            </div>
        </Navigate>
    )

    else if (content)
        return (
            <Navigate
                className="block my-1 p-2 border border-gray20 rounded-md w-full"
                comp="link" type="button" goto={`/comment/${replied_to}`}>
                <p className="mb-1 text-xs sm:text-sm text-zinc-500">Replied to:</p>
                <p className="text-sm line-clamp-2">{content}</p>
            </Navigate>
        )

}

const CommentBar = ({ _id, attachment, nsfw, spoiler, post_id, content, status, saved_count, likes_count, profile, parentComment, replied_to, username, createdAt, edited_at, restrictReply }: Props) => {

    const [, setReply] = useGlobalStore<ReplyInputType | undefined>(`reply:post:${post_id}`, undefined);

    const handleReply = () => {
        if (status === "sending" || restrictReply) return;

        setReply({
            content: content,
            replied_to: _id,
            attachment,
            username,
        })
    }

    return (
        <article className="w-full my-2 group-last:border-0 border-b border-gray30">
            <details className="w-full p-2" open={!Boolean(nsfw || spoiler)}>

                <summary className="marker:hidden">
                    <div className="flex gap-3 items-center">
                        <ParloImage
                            frameType="userProfile"
                            frame={profile}
                            className="min-w-10 size-10 object-cover"
                            containerClassName="rounded-full overflow-hidden"
                            classNameForFallback="size-6"
                            size={32}
                            alt={`profile picture of ${username}`}
                        />
                        <OptionalChildren condition={username} fallback={(
                            <span className="text-gray-500 font-semibold">*Deleted User*</span>
                        )}>
                            <Navigate
                                historyPayload={{
                                    title: username,
                                    poster: profile,
                                }}
                                comp="link"
                                role="button"
                                goto={`/user/${username}`}
                                className="font-semibold"
                            >
                                {username}
                            </Navigate>
                        </OptionalChildren>
                    </div>

                    <MetadataTileContainer className="mt-2">
                        <MetadataTile className="text-xs">{timeAgo(createdAt)}</MetadataTile>

                        <MetadataTile className="text-xs" condition={!!edited_at}>Edited</MetadataTile>

                        <MetadataTile condition={nsfw} className="py-1 px-2 text-xs" nsfw>NSFW</MetadataTile>
                        <MetadataTile condition={spoiler} className="py-1 px-2 text-xs" spoiler>Spoiler</MetadataTile>

                    </MetadataTileContainer>
                </summary>

                <ParentCommentBar parentComment={parentComment ? { ...parentComment, replied_to, username: undefined } : undefined} />

                <div className="my-2 space-y-4">
                    <Link
                        historyPayload={{
                            title: content?.slice(0, 50).concat('...'),
                            poster: profile,
                            image: attachment,
                        }}
                        status={status}
                        link={`/comment/${_id}`}
                        className="space-y-4 my-2"
                    >
                        <OptionalChildren condition={attachment}>
                            <Image
                                src={attachment}
                                alt="Attachment"
                                className="size-24 rounded-md border border-gray30 object-contain"
                                unoptimized
                                height={96}
                                width={96}
                            />
                        </OptionalChildren>
                        <p>{content}</p>
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