"use client";

import { CommentIcon } from "@assets/Icons";
import { DynamicComponent, Navbar, Navigate } from "@components";
import { LinkTile } from "@components/ui";
import { getPostById } from "@lib/helpers/common";
import { getInternalPoster, numberConverter, timeAgo } from "@lib/utils";
import { FullPost } from "@type/internal";
import Image from "next/image";
import Frames from "./Frames";
import OptionsButton from "./OptionsButton";
import ReactionButton from "./ReactionButton";
import { PropsWithChildren } from "react";
import SaveButton from "@components/SaveButton";

type Props = PropsWithChildren<{ id: string }>

const getQueryProps = ({ id }: Props) => {
    return {
        queryKeys: ['post', id],
        args: [id],
        queryFn: getPostById
    }
}

const PostHeader = DynamicComponent<FullPost, Props>({
    component: (data, { children }) => {

        const { _id, username, edited_at, user_id, saved_count, poster, body, comment_count, createdAt, frames, links, nsfw, reaction_count, spoiler, tag, thread_id, title, } = data;

        return (
            <>
                <Navbar
                    titleToShare={`Check out this post by ${username} on Popcorn Paragon`}
                    OptionButton={<OptionsButton id={_id} author={user_id} />}
                    className="sticky bg-primary -mt-4 mb-4"
                    navTitle={title}
                />

                <header className="flex gap-2 items-center">
                    <Navigate comp="link" role="button" goto={`/t/${thread_id}`}>
                        <Image
                            className="size-8 rounded-full"
                            src={getInternalPoster({ path: poster })}
                            width={20} height={20} alt="Thread poster" />
                    </Navigate>
                    {username ?
                        <Navigate comp="link" role="button" goto={`/u/${username}`} className="font-semibold">{username}</Navigate>
                        :
                        <span className="text-gray-500 text-semibold">[deleted]</span>
                    }
                </header>

                <section className="mt-2 space-y-4">

                    <ul className="my-4 flex gap-4 items-center text-xs capitalize">
                        {tag &&
                            <li className="inline px-4 py-1 bg-gray20 rounded-md">{tag}</li>
                        }
                        {nsfw &&
                            <li className="inline px-4 py-1 bg-violet-500 bg-opacity-50 rounded-md">NSFW</li>
                        }
                        {spoiler &&
                            <li className="inline px-4 py-1 bg-red-500 bg-opacity-50 rounded-md">spoiler</li>
                        }
                        <li className="text-gray-500 list-[circle]">{timeAgo(createdAt)}</li>
                        {edited_at &&
                            <li className="text-zinc-500 list-[circle]" title={`Edited at ${new Date(edited_at).toDateString()}`}>Edited</li>
                        }
                    </ul>

                    <h1 className="text-xl font-semibold">{title}</h1>

                    <p className="whitespace-break-spaces">{body}</p>

                </section>

                <section className="my-2">
                    <Frames frames={frames} />
                </section>

                <ul className="my-4 flex gap-4 overflow-x-auto noScroll">
                    {links.map(link => (
                        <li key={link.path}>
                            <LinkTile {...link} />
                        </li>
                    ))}
                </ul>

                <section className="mt-2 flex flex-cntr-between">
                    <div className="flex gap-4">
                        <ReactionButton id={_id} count={reaction_count} />

                        <span className="flex gap-2 p-2 border border-gray-500 border-opacity-30 rounded-md">
                            <CommentIcon className="size-4" />
                            {numberConverter(comment_count)}
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <Navigate comp="link" role="button" goto={`/new?pid=${_id}&uid=${user_id}`}>
                            Repost
                        </Navigate>
                        <SaveButton type="Post" count={saved_count} id={_id} />
                    </div>
                </section>

                {children}
            </>
        )
    },
    getQueryProps,
})

export default PostHeader;