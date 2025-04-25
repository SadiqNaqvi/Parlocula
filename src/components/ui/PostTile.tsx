import { BookmarkIcon, ChartIcon, CommentIcon, Ellipsis, ShareIcon, ThumbUpIcon } from "@assets/Icons";
import { Navigate } from "@components";
import { refineString } from "@lib/dataRefiner";
import { getInternalPoster, numberConverter, timeAgo } from "@lib/utils";
import { MerePost } from "@type/internal";
import Image from "next/image";

const posterOptions = {
    w: 192, crop: "fill", aspect_ration: "1"
}

const frameOption = {
    w: 250, crop: "fill", aspect_ration: "1"
}

export default function PostTile({ classnames = "", _id, comment_count, nsfw, createdAt, updatedAt, poster, reaction_count, spoiler, tag, thread_id, title, frames, username, name }: { classnames?: string } & MerePost) {

    return (
        <article className="space-y-3 border-b border-gray40 py-3">
            <header className="flex flex-cntr-between">
                <div className="flex gap-2 items-center">

                    <Navigate comp="link" role="button" goto={`/u/${username}`}>
                        <Image
                            src={getInternalPoster({ path: poster, options: posterOptions })}
                            className="size-10 inline object-cover rounded-full"
                            loading="lazy" height={50} width={50} alt="" />
                    </Navigate>

                    {name ?
                        <Navigate comp="link" role="button" goto={`/t/${thread_id}`} className="font-semibold">{name}</Navigate>
                        :
                        <span className="font-semibold">[deleted]</span>
                    }

                    <span className="text-sm text-zinc-500">{timeAgo(createdAt)}</span>

                    {createdAt !== updatedAt &&
                        <span className="list-item list-[circle] text-sm bg-gray50 rounded-md" title={`Edited at ${new Date(updatedAt).toTimeString()}`}>Edited</span>
                    }
                </div>
                <button className="smallBtn border-0"><Ellipsis /></button>
            </header>

            <Navigate role="button" comp="link" goto={`/p/${_id}-${refineString(title)}`} className={`w-full ${classnames}`}>
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
                        <Image src={getInternalPoster({ path: frame.path, options: frameOption })} loading="lazy" className="size-48 min-w-48" height={300} width={300} alt="" />
                    } */}
                </div>
            </Navigate>

            <section className="flex flex-cntr-between">
                <div className="space-x-2">
                    <span className="text-sm">
                        <ThumbUpIcon classnames="inline mr-1 h-5 align-top" />
                        {numberConverter(reaction_count)}
                    </span>
                    <span className="text-sm">
                        <CommentIcon classnames="inline mr-1 h-5 align-top" />
                        {numberConverter(comment_count)}
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
        </article >
    )
}