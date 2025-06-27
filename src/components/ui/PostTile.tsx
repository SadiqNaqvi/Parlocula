import { BookmarkIcon, ChartIcon, CommentIcon, Ellipsis, ShareIcon, ThumbUpIcon } from "@assets/Icons";
import { Navigate } from "@components";
import Carousel from "@components/FancyCarousel";
import FramesCarousel from "@components/FramesCarousel";
import { getPoster, numberConverter, timeAgo, refineString } from "@lib/utils";
import { MerePost } from "@type/internal";
import Image from "next/image";

export default function PostTile({ className = "", _id, comment_count, nsfw, createdAt, editedAt, poster, reaction_count, spoiler, tag, thread_id, title, frames, saved_count, username, name }: { className?: string } & MerePost) {

    return (
        <article className={`p-2 w-full space-y-3 border-b border-gray40 ${className}`}>
            <header className="flex gap-2 mb-2 items-center">

                <Navigate comp="link" role="button" goto={`/u/${username}`}>
                    <Image
                        src={getPoster({ external: false, path: poster ?? "", type: "image" })}
                        className="size-10 inline object-cover rounded-full"
                        loading="lazy" height={50} width={50} alt="" />
                </Navigate>

                {name ?
                    <Navigate comp="link" role="button" goto={`/t/${thread_id}`} className="font-semibold">{name}</Navigate>
                    :
                    <span className="font-semibold">[deleted]</span>
                }

                <span className="text-sm text-zinc-500">{timeAgo(createdAt)}</span>

                {editedAt &&
                    <span className="list-item list-[circle] text-sm bg-gray50 rounded-md" title={`Edited at ${new Date(editedAt).toTimeString()}`}>Edited</span>
                }
            </header>

            <div className="flex gap-4 my-2 flex-col sm:flex-row-reverse">

                <Navigate role="button" comp="link" goto={`/p/${_id}-${refineString(title)}`} className="w-full">
                    <ul className="flex gap-3">
                        {tag &&
                            <li className="bg-gray10 rounded-md px-3 py-1 text-xs capitalize">{tag}</li>
                        }
                        {nsfw &&
                            <li className="bg-violet-500 bg-opacity-30 rounded-md text-xs px-3 py-1">NSFW</li>
                        }
                        {spoiler &&
                            <li className="bg-red-300 bg-opacity-30 rounded-md px-3 py-1 text-xs">SPOILER</li>
                        }
                    </ul>

                    <div className="flex gap-2 my-3">
                        <h3 className="text-lg font-semibold line-clamp-4">{title}</h3>
                        {/* {frames && !spoiler && frame.type === "image" &&
                        <Image src={getPoster({ path: frame.path, options: frameOption })} loading="lazy" className="size-48 min-w-48" height={300} width={300} alt="" />
                    } */}
                    </div>
                </Navigate>

                {frames && !!frames.length && <FramesCarousel className="w-full sm:w-80" frames={frames} />}
            </div>

            <div className="space-x-2">
                <span className="text-sm text-zinc-500">
                    <ThumbUpIcon className="inline mr-1 h-4 align-top" />
                    {numberConverter(reaction_count)}
                </span>
                <span className="text-sm text-zinc-500">
                    <CommentIcon className="inline mr-1 h-4 align-top" />
                    {numberConverter(comment_count)}
                </span>
                <span className="text-sm text-zinc-500">
                    <BookmarkIcon className="inline mr-1 h-4 align-top" />
                    {saved_count}
                </span>
            </div>
        </article >
    )
}