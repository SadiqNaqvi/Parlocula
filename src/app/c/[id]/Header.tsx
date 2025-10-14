"use client";

import { GenericWrapper, Navbar, Navigate } from "@components";
import SaveButton from "@components/SaveButton";
import { TabContainer, TabList } from "@components/ui/Tabs";
import { getCommentById } from "@lib/helpers/common";
import { getPoster, getQueryKeys, timeAgo } from "@lib/utils";
import { FullComment } from "@type/internal";
import Image from "next/image";
import OptionsButton from "./Ellipsis";
import VoteButton from "./VoteButton";
import MetadataTile from "@components/ui/MetaDataTile";
import { LinkIcon } from "@assets/Icons";

type Props = {
    id: string,
    uid: string | undefined,
}

const getQueryProps = ({ id }: Props) => ({
    queryKeys: getQueryKeys("comment_cid", { cid: id }),
    args: [id],
    queryFn: getCommentById
});

const VisitButtons = ({ id, type }: { type: "post" | "comment", id: string }) => {
    return (
        <Navigate
            goto={`/${type === "comment" ? 'c' : 'p'}/${id}`}
            comp="link"
        >
            <LinkIcon />
            {type === "post" ? "Post" : "Parent"}
        </Navigate>
    )
}

const component = (data: FullComment, { uid, id }: Props) => {
    const {
        _id, saved_count, attachment, content, createdAt, user_id, post_id, replied_to, edited_at, upvote_count, profile, username, post_author, nsfw, spoiler
    } = data;

    return (
        <>
            <Navbar
                titleToShare={`Read the comment by ${username} and their replies on Popcorn Paragon`}
                className="sticky bg-primary -mt-4 mb-4"
                OptionButton={
                    <OptionsButton comment={data} author={user_id} id={_id} />
                }
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

                    {username ? (
                        <Navigate
                            comp="link"
                            role="button"
                            className="font-semibold"
                            goto={`/u/${username}`}
                        >
                            {username}
                        </Navigate>
                    )
                        :
                        <span className="font-semibold">[deleted]</span>
                    }

                    <MetadataTile createdAt={createdAt} editedAt={edited_at} nsfw={nsfw} spoiler={spoiler} />
                </div>

                <p className="my-4">{content}</p>

                {attachment && (
                    <Image
                        height={250}
                        width={250}
                        src={attachment}
                        alt="Attachment"
                        className="size-[250px] rounded-md border border-gray30 object-contain"
                    />)
                }

                <div className="mt-4 flex gap-3 pb-4 mb-4 border-b border-gray40 items-center">
                    <VoteButton uid={uid} author={post_author} id={_id} voteCount={upvote_count} />
                    <SaveButton uid={uid} count={saved_count} id={_id} type="Comment" />
                    <VisitButtons id={post_id} type="post" />
                    {replied_to && <VisitButtons type="comment" id={replied_to} />}
                </div>
                
            </header>

            <TabContainer>
                <TabList href={`/c/${id}`}>Replies</TabList>
                <TabList href={`/c/${id}/reports`}>Reports</TabList>
            </TabContainer>
        </>
    );
}

const CommentHeader = (props: Props) => GenericWrapper({ component, getQueryProps, props });

export default CommentHeader;