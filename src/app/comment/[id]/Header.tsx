"use client";

import { GenericWrapper, Navbar, Navigate, SaveButton } from "@components";
import { BreadCrumbs, BreadCrumbTile, MetadataTile, MetadataTileContainer, ParloImage, TabContainer, TabList } from "@components/ui";
import { getCommentById } from "@lib/helpers/common";
import { getQueryKeys, timeAgo } from "@lib/utils";
import { FullComment } from "@type/internal";
import Image from "next/image";
import OptionsButton from "./Ellipsis";
import LikeButton from "./LikeButton";
import { ContentFiltered } from "@components/fallbacks";

type Props = {
    id: string,
    uid: string | undefined,
}

const getQueryProps = ({ id }: Props) => ({
    queryKeys: getQueryKeys("comment_cid", { cid: id }),
    args: [id],
    queryFn: getCommentById
});

const Component = (data: FullComment, { uid, id }: Props) => {

    const {
        _id, thread_id, parentComment, saved_count, attachment, content, createdAt, user_id, post_id, replied_to, edited_at, likes_count, profile, username, post_author, nsfw, spoiler
    } = data;

    return (
        <>

            <ContentFiltered allow={user_id === uid} redirectPath={`/comment/${_id}`} />
            <Navbar
                titleToShare={`Read the comment by ${username} and their replies on Parlocula`}
                className="sticky bg-primary -mt-4 mb-4"
                OptionButton={
                    <OptionsButton comment={data} author={user_id} id={_id} />
                }
            />

            <article className="space-y-4">

                <BreadCrumbs>
                    <BreadCrumbTile href={thread_id}>Thread</BreadCrumbTile>
                    <BreadCrumbTile href={post_id}>Post</BreadCrumbTile>
                    {parentComment && replied_to && (
                        <BreadCrumbTile href={replied_to}>{parentComment.content || "Parent Comment"}</BreadCrumbTile>
                    )}
                </BreadCrumbs>

                <header className="flex items-center gap-3">

                    <ParloImage
                        containerClassName="max-h-6 overflow-hidden"
                        className="min-w-6 size-6 object-cover rounded-full"
                        frame={profile}
                        frameType="userProfile"
                        size={24}
                        alt="Profile Picture of the author of comment"
                    />

                    {username ? (
                        <Navigate
                            comp="link"
                            type="button"
                            className="font-semibold"
                            goto={`/user/${username}`}
                        >
                            {username}
                        </Navigate>
                    )
                        :
                        <span className="font-semibold">Parlocula User</span>
                    }

                </header>

                <MetadataTileContainer>
                    <MetadataTile>{timeAgo(createdAt)}</MetadataTile>
                    <MetadataTile className="px-2 py-1 bg-gray10 border-gray20 rounded-md" condition={Boolean(edited_at)}>Edited: {timeAgo(edited_at)}</MetadataTile>
                    <MetadataTile className="px-2 py-1 bg-gray10 border-purple-500 text-purple-500 rounded-md" condition={nsfw}>NSFW</MetadataTile>
                    <MetadataTile className="px-2 py-1 bg-gray10 border-orange-500 text-orange-500 rounded-md" condition={spoiler}>Spoiler</MetadataTile>
                </MetadataTileContainer>

                <section className="flex gap-4 flex-col sm:flex-row py-4 border-t border-gray30">

                    <p>{content}</p>

                    {attachment && (
                        <Image
                            height={250}
                            width={250}
                            src={attachment}
                            alt="Attachment"
                            className="size-[250px] rounded-md border border-gray30 object-contain"
                        />)
                    }
                </section>

            </article>

            <div className="flex gap-2 pb-4 mb-4 border-y border-gray30 items-center">

                <LikeButton uid={uid} author={post_author} id={_id} likesCount={likes_count} />

                <SaveButton author={user_id} uid={uid} count={saved_count} id={_id} type="Comment" />

            </div>

            <TabContainer>
                <TabList href={`/comment/${id}`}>Replies</TabList>
                <TabList href={`/comment/${id}/reports`}>Reports</TabList>
            </TabContainer>
        </>
    );
}

const CommentHeader = (props: Props) => GenericWrapper({ component: Component, getQueryProps, props });

export default CommentHeader;