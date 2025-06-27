"use client";

import { GenericWrapper, Navbar, Navigate } from "@components";
import SaveButton from "@components/SaveButton";
import { getCommentById } from "@lib/helpers/common";
import { getPoster, getQueryKeys, timeAgo } from "@lib/utils";
import { FullComment } from "@type/internal";
import Image from "next/image";
import RepliesSection from "./RepliesSection";
import VoteButton from "./VoteButton";
import OptionsButton from "./Ellipsis";

type Props = {
    id: string,
    filter: string,
    page: number,
}

const getQueryProps = ({ id }: Props) => ({
    queryKeys: getQueryKeys("comment_cid", { cid: id }),
    args: [id],
    queryFn: getCommentById
});

const component = (data: FullComment, { filter, page }: Props) => {
    const {
        _id, saved_count, attachment, content, createdAt, user_id, post_id, edited_at, upvote_count, profile, username, post_author, nsfw, spoiler
    } = data;

    return (
        <>
            <Navbar
                titleToShare={`Read the comment by ${username} and their replies on Popcorn Paragon`}
                className="sticky bg-primary -mt-4 mb-4"
                OptionButton={<OptionsButton author={user_id} id={_id} />}
            />

            <header className="space-y-4">
                <div className="flex items-center gap-3">
                    <Image
                        className="rounded-full"
                        src={getPoster({ external: false, path: profile })}
                        height={25}
                        width={25}
                        alt="Profile picture of user"
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
                        {edited_at &&
                            <li className="text-xs px-2 py-1" title={new Date(edited_at).toDateString()}>
                                Edited
                            </li>
                        }
                        {nsfw && <li className="bg-red-400 bg-opacity-20 rounded-md text-xs px-2 py-1">NSFW</li>}
                        {spoiler && <li className="bg-yellow-400 bg-opacity-20 rounded-md text-xs px-2 py-1">Spoiler</li>}
                    </ul>
                </div>

                <p className="my-4">{content}</p>

                {attachment &&
                    <Image
                        height={250}
                        width={250}
                        src={attachment}
                        alt="Attachment"
                        className="size-[250px] rounded-md border border-gray30 object-contain"
                    />
                }

                <section className="mt-4 flex gap-3 pb-4 mb-4 border-b border-gray40 items-center">
                    <VoteButton author={post_author} id={_id} voteCount={upvote_count} />
                    <SaveButton count={saved_count} id={_id} type="Comment" />
                </section>
            </header>

            <RepliesSection filter={filter} page={page} post_author={post_author} post_id={post_id} id={_id} />
        </>
    );
}

const CommentPage = (props: Props) => GenericWrapper({ component, getQueryProps, props });

export default CommentPage;