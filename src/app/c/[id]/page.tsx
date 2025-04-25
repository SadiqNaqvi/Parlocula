import Navbar from "@app/explore/(withoutSidebar)/exploreComponents/Navbar";
import { BookmarkIcon, Ellipsis, ShareIcon } from "@assets/Icons";
import { DynamicComponent, Navigate } from "@components";
import { getCommentById } from "@lib/helpers/common";
import { getInternalPoster, timeAgo } from "@lib/utils";
import { MereComment } from "@type/internal";
import Image from "next/image";
import VoteButton from "./VoteButton";
import RepliesSection from "./RepliesSection";

type Props = {
    params: { id: string },
    searchParams: { f?: string }
}

const getComment = async ({ params }: Props) => await getCommentById(params.id);

const Page = DynamicComponent((data) => {

    const {
        _id, attachment, content, createdAt, post_id, updatedAt, upvote_count, profile, username, post_author, nsfw, spoiler, replied_to
    } = data as MereComment;

    return (
        <>
            <Navbar classnames="sticky bg-primary -mt-4 mb-4" />
            <header className="flex items-center gap-3">
                <Image
                    className="rounded-full"
                    src={getInternalPoster({ path: profile, options: { width: "25" } })}
                    height={25}
                    width={25}
                    alt={`Profile picture of user`}
                />
                {username ?
                    <Navigate
                        comp="link"
                        role="button"
                        className="font-semibold"
                        goto={`/u/${username}`}
                    >
                        {username}
                    </Navigate>
                    :
                    <span className="font-semibold">[deleted]</span>
                }
                <ul className="flex gap-3">
                    <li className="text-sm text-zinc-500">{timeAgo(createdAt)}</li>
                    {createdAt !== updatedAt &&
                        <li
                            className="text-xs px-2 py-1 bg-gray20"
                            title={new Date(updatedAt).toDateString()}
                        >Edited
                        </li>
                    }
                    {nsfw && <li className="bg-red-400 bg-opacity-20 rounded-md text-xs px-2 py-1">NSFW</li>}
                    {spoiler && <li className="bg-yellow-400 bg-opacity-20 rounded-md text-xs px-2 py-1">Spoiler</li>}
                </ul>
            </header>
            <p className="my-4">{content}</p>
            {attachment &&
                <img
                    src={attachment}
                    alt="Attachment"
                    className="size-[250px] rounded-md border border-gray30 object-contain"
                />
            }
            <section className="pt-2 mt-2 border-t border-gray20 flex flex-cntr-between">
                <VoteButton id={_id} voteCount={upvote_count} />
                <div className="border border-gray30 rounded-lg p-1">
                    <button className="smallBtn">
                        <ShareIcon />
                    </button>
                    <button className="smallBtn border-l border-gray30 pl-1 ml-1">
                        <BookmarkIcon />
                    </button>
                </div>
            </section>
            <section className="h-dvh">
                <RepliesSection post_author={post_author} post_id={post_id} id={_id} />
            </section>
        </>
    )

}, getComment);

export default Page;