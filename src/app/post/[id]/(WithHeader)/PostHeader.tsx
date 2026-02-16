"use client";

import { CommentIcon, QuoteIcon } from "@assets/Icons";
import { FramesCarousel, GenericWrapper, Navbar, Navigate, SaveButton } from "@components";
import { MetadataTile, MetadataTileContainer, OptionalChildren, ParloImage } from "@components/ui";
import { BreadCrumbs, BreadCrumbTile } from "@components/ui/Breadcrumbs";
import LinksSection from "@components/ui/LinksSection";
import { getPostById } from "@lib/helpers/common";
import { getQueryKeys, makeUrlSafe, numberConverter, timeAgo } from "@lib/utils";
import useGlobalStore from "@store/globalStore";
import { useNavigation } from "@store/historystack";
import { FullPost } from "@type/internal";
import OptionsButton from "./OptionsButton";
import ReactionButton from "./ReactionButton";

type Props = { id: string, uid: string | undefined }

const getQueryProps = ({ id }: Props) => ({
    queryKeys: getQueryKeys("post_id", { id }),
    args: [id],
    queryFn: getPostById
})

const Component = (data: FullPost, { uid }: Props) => {

    const { _id, username, poster, edited_at, user_id, saved_count, thread_name, body, comment_count, quoted_post_frames_count, quoted_post_id, quoted_post_links_count, quoted_post_title, createdAt, frames, links, nsfw, reaction_count, spoiler, category, thread_id, title, } = data;

    return (
        <>
            <Navbar
                navTitle="Post"
                titleToShare={`Check out this post by ${username} on Parlocula`}
                OptionButton={<OptionsButton post={data} />}
                className="sticky bg-primary -mt-4 mb-4"
            />

            <article>

                <BreadCrumbs>
                    <BreadCrumbTile href={`/thread/${thread_id}-${makeUrlSafe(thread_name)}`}>{thread_name}</BreadCrumbTile>
                </BreadCrumbs>

                <header className="px-4 flex gap-2 items-center">
                    <Navigate comp="link" role="button" goto={`/thread/${thread_id}`}>
                        <ParloImage
                            frameType="threadPoster"
                            containerClassName="rounded-full overflow-hidden"
                            frame={poster}
                            size={28}
                            alt="Profile Picture of the author of the post"
                        />
                    </Navigate>
                    <OptionalChildren condition={username} fallback={(
                        <span className="text-gray-500 text-semibold">Parlocula User</span>
                    )}>
                        <Navigate
                            comp="link"
                            type="button"
                            goto={`/user/${username}`}
                            className="font-semibold">
                            {username}
                        </Navigate>
                    </OptionalChildren>
                </header>

                <OptionalChildren condition={quoted_post_id && quoted_post_title}>
                    <section className="my-2 border border-gray30">
                        <Navigate comp="link" goto={`/post/${quoted_post_id}`} className="py-2">
                            <p className="mt-2 font-bold line-clamp-2">
                                {quoted_post_title}
                            </p>
                            <div className="flex gap-2">
                                <div className="text-sm text-zinc-500 flex items-center gap-2">
                                    <QuoteIcon />
                                    <span>Quoted</span>
                                </div>
                                <div className="text-sm text-zinc-500">
                                    Frames: {quoted_post_frames_count}
                                </div>
                                <div className="text-sm text-zinc-500">
                                    Links: {quoted_post_links_count}
                                </div>
                            </div>
                        </Navigate>
                    </section>
                </OptionalChildren>

                <section className="px-4 mt-2 space-y-4">

                    <MetadataTileContainer>
                        <MetadataTile>{timeAgo(createdAt)}</MetadataTile>

                        <MetadataTile
                            condition={category !== "none"}
                            href={`/thread/${thread_id}?c=${category}`}
                            className="capitalize">
                            {category}
                        </MetadataTile>

                        <MetadataTile className="px-2 py-1 bg-gray10 border-gray20 rounded-md" condition={Boolean(edited_at)}>Edited: {timeAgo(edited_at)}</MetadataTile>

                        <MetadataTile className="px-2 py-1 bg-gray10 border-purple-500 text-purple-500 rounded-md" condition={nsfw}>NSFW</MetadataTile>

                        <MetadataTile className="px-2 py-1 bg-gray10 border-orange-500 text-orange-500 rounded-md" condition={spoiler}>Spoiler</MetadataTile>

                    </MetadataTileContainer>

                    <h1 className="text-lg sm:text-xl font-semibold">{title}</h1>

                    <p className="whitespace-break-spaces">{body}</p>

                </section>

                <section className="sm:px-4 my-2 w-full max-w-[400px] aspect-square mx-auto sm:border border-gray20">
                    <FramesCarousel className="sm:rounded-md" frames={frames} />
                </section>

                <LinksSection links={links} />
            </article>

            <div className="px-4 flex items-center gap-3">
                <ReactionButton uid={uid} id={_id} count={reaction_count} />

                <div className="flex gap-2 text-sm items-center">
                    <span><CommentIcon /></span>
                    <span>{numberConverter(comment_count)}</span>
                </div>

                <SaveButton author={user_id} uid={uid} type="Post" count={saved_count} id={_id} />


                <Navigate
                    comp="link"
                    goto={`/new/post?qpid=${data._id}`}
                    className="py-1 space-x-2 hover:bg-[var(--gray10)]">
                    <QuoteIcon />
                    <span>Quote</span>
                </Navigate>
            </div>

        </>
    )
}

const PostHeader = (props: Props) => {


    return <GenericWrapper
        component={Component}
        getQueryProps={getQueryProps}
        props={props}
    />
}

export default PostHeader;