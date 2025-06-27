import { ThumbUpIcon } from "@assets/Icons";
import { Navigate } from "@components";
import { getPoster, numberConverter, timeAgo } from "@lib/utils";
import { MereComment } from "@type/internal";
import Image from "next/image";
import toast from "react-hot-toast";

const Link = ({ children, link, className }: { children: React.ReactNode, link: string | undefined, className?: string }) => (
    <>{link ?
        <Navigate className={className} comp="link" goto={link}>{children}</Navigate>
        : <p>{children}</p>
    }</>
)

export default function CommentTile({ _id, attachment, nsfw, spoiler, callback, user, content, upvote_count, parent, profile, replied_to, username, createdAt, edited_at }: MereComment & { callback?: any, user?: any }) {

    const reply = () => {
        if (!user) {
            toast.error("You need to log-in to reply a comment")
            return;
        }
        callback?.({ parent: content, replied_to: _id });
    }

    return (
        <article className="w-full my-2 bg-primarylight">
            {parent && replied_to &&
                <Navigate
                    comp="link"
                    goto={`/c/${replied_to}`}
                    className="p-3 inline-block text-xs border rounded-md rounded-l-none border-gray30">
                    {parent}...
                </Navigate>
            }
            <details className="w-full p-2 border-l border-gray30" open={!nsfw && !spoiler}>
                <summary className="flex gap-3 items-center">
                    <Image
                        src={getPoster({ path: profile })}
                        className="size-8 rounded-full object-cover"
                        height={32}
                        width={32}
                        alt={`profile picture of ${username}`}
                    />

                    {username ?
                        <Navigate comp="link" role="button" goto={`/u/${username}`} className="font-semibold">{username}</Navigate>
                        :
                        <span className="text-gray-500 font-semibold">[deleted]</span>
                    }

                    <ul className="flex gap-2 items-center">
                        <li className="text-gray-500 text-xs">{timeAgo(createdAt)}</li>

                        {edited_at && <li className="bg-gray20 rounded-md text-xs px-2 py-1">Edited</li>}

                        {nsfw && <li className="bg-red-400 bg-opacity-20 rounded-md text-xs px-2 py-1">NSFW</li>}

                        {spoiler && <li className="bg-yellow-400 bg-opacity-20 rounded-md text-xs px-2 py-1">Spoiler</li>}
                    </ul>
                </summary>
                <div className="my-2 space-y-4">
                    <Link link={_id ? `/c/${_id}` : ''} className="space-y-4 my-2">
                        <p className="text-sm">{content}</p>
                        {attachment &&
                            <img
                                src={attachment}
                                alt="Attachment"
                                className="size-[200px] rounded-md border border-gray30 object-contain"
                            />
                        }
                    </Link>
                    <section className="flex mt-2 gap-3">

                        <span className="flex gap-1 text-gray-500">
                            <ThumbUpIcon className="h-4" />
                            {numberConverter(upvote_count)}
                        </span>
                        {_id &&
                            <button className="smallBtn my-auto border-0" onClick={reply}>Reply</button>
                        }
                    </section>
                </div>
            </details>
        </article>
    )
}

export const LoadingCommentTile = () => {
    return (
        <div className="w-full space-y-2">
            <div className="gap-4 flex items-center">
                <div className="size-8 rounded-full animate-pulse"></div>
                <div className="h-3 w-[60%] rounded-lg skeletonLoading"></div>
            </div>
            <div className="space-y-2">
                <div className="h-2 w-[90%] rounded-lg skeletonLoading"></div>
                <div className="h-2 w-[90%] rounded-lg skeletonLoading"></div>
                <div className="h-2 w-[50%] rounded-lg skeletonLoading"></div>
            </div>
        </div>
    )
}