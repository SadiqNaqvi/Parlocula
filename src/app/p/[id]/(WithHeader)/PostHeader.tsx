"use client";

import { CommentIcon, RepostIcon } from "@assets/Icons";
import { GenericWrapper, Navbar, Navigate } from "@components";
import SaveButton from "@components/SaveButton";
import { LinkTile } from "@components/ui";
import { getPostById } from "@lib/helpers/common";
import { getPoster, getQueryKeys, numberConverter, timeAgo } from "@lib/utils";
import { FullPost } from "@type/internal";
import Image from "next/image";
import FramesCarousel from "@components/FramesCarousel";
import OptionsButton from "./OptionsButton";
import ReactionButton from "./ReactionButton";

type Props = { id: string, uid: string | undefined }

const getQueryProps = ({ id }: Props) => {
    return {
        queryKeys: getQueryKeys("post_id", { id }),
        args: [id],
        queryFn: getPostById
    }
}

const component = (data: FullPost, { uid }: Props) => {

    const { _id, username, edited_at, user_id, saved_count, poster, body, comment_count, createdAt, frames, links, nsfw, reaction_count, spoiler, tag, thread_id, title, } = data;

    return (
        <>
            <Navbar
                titleToShare={`Check out this post by ${username} on Popcorn Paragon`}
                OptionButton={<OptionsButton id={_id} author={user_id} />}
                className="sticky bg-primary -mt-4 mb-4"
            />

            <header className="px-4 flex gap-2 items-center">
                <Navigate comp="link" role="button" goto={`/t/${thread_id}`}>
                    <Image
                        className="size-8 rounded-full"
                        src={getPoster({ path: poster })}
                        width={20} height={20} alt="Thread poster" />
                </Navigate>
                {username ?
                    <Navigate comp="link" role="button" goto={`/u/${username}`} className="font-semibold">{username}</Navigate>
                    :
                    <span className="text-gray-500 text-semibold">[deleted]</span>
                }
            </header>

            <section className="px-4 mt-2 space-y-4">

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

                <h1 data-observe className="text-xl font-semibold">{title}</h1>

                <p className="whitespace-break-spaces">{body}</p>

            </section>

            <section className="px-4 my-2">
                <FramesCarousel frames={frames} />
            </section>

            <ul className="px-4 my-4 flex gap-4 overflow-x-auto noScroll">
                {links.map(link => (
                    <li key={link.path}>
                        <LinkTile {...link} />
                    </li>
                ))}
            </ul>

            <div className="px-4 flex items-center gap-3">
                <ReactionButton uid={uid} id={_id} count={reaction_count} />

                <span className="flex gap-2 items-center text-sm">
                    <SaveButton uid={uid} type="Post" count={saved_count} id={_id} />
                </span>

                <span className="flex gap-2 items-center text-sm">
                    <CommentIcon />
                    {numberConverter(comment_count)}
                </span>
                <Navigate className="py-1 space-x-2 hover:bg-[var(--gray30)]" comp="link" role="button" goto={`/new?pid=${_id}&uid=${user_id}`}>
                    <span>Repost</span>
                    <RepostIcon />
                </Navigate>
            </div>

        </>
    )
}

const PostHeader = (props: Props) => GenericWrapper({ component, getQueryProps, props })

export default PostHeader;