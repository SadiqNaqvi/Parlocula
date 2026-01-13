"use client";

import { CommentIcon, QuoteIcon } from "@assets/Icons";
import { FramesCarousel, GenericWrapper, Navbar, Navigate, SaveButton } from "@components";
import { MetadataTile, OptionalChildren, ParloImage } from "@components/ui";
import LinksSection from "@components/ui/LinksSection";
import { getPostById } from "@lib/helpers/common";
import { getPoster, getQueryKeys, numberConverter, makeUrlSafe } from "@lib/utils";
import useGlobalStore from "@store/globalStore";
import { useNavigation } from "@store/historystack";
import { FullPost } from "@type/internal";
import Image from "next/image";
import OptionsButton from "./OptionsButton";
import ReactionButton from "./ReactionButton";
import { BreadCrumbs, BreadCrumbTile } from "@components/ui/Breadcrumbs";

type Props = { id: string, uid: string | undefined }

const getQueryProps = ({ id }: Props) => ({
    queryKeys: getQueryKeys("post_id", { id }),
    args: [id],
    queryFn: getPostById
})

const PostHeader = (props: Props) => {
    const navigation = useNavigation();
    const [, setThreadToPost] = useGlobalStore<{ title: string, id: string, author: string } | undefined>("postToQuote");

    const Component = (data: FullPost, { uid }: Props) => {

        const handleQuote = () => {
            setThreadToPost({ title: data.title, id: data._id, author: data.user_id });
            navigation.goto("/new");
        }

        const { _id, username, edited_at, user_id, saved_count, poster, thread_name, body, comment_count, quoted_post_frames_count, quoted_post_id, quoted_post_links_count, quoted_post_title, createdAt, frames, links, nsfw, reaction_count, spoiler, category, thread_id, title, } = data;

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
                                containerClassName="rounded-full overflow-hidden"
                                frame={data.poster}
                                size={28}
                                alt="Profile Picture of the author of the post"
                            />
                        </Navigate>
                        {username ?
                            (
                                <Navigate
                                    comp="link"
                                    type="button"
                                    goto={`/user/${username}`}
                                    className="font-semibold">
                                    {username}
                                </Navigate>
                            )
                            :
                            <span className="text-gray-500 text-semibold">[Not Found]</span>
                        }
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

                        <div className="flex gap-3">
                            {category && (
                                <Navigate comp="link" goto={`/thread/${thread_id}?c=${category}`} className="text-sm p-2 bg-gray20 rounded-full capitalize">
                                    {category}
                                </Navigate>
                            )}
                            <MetadataTile createdAt={createdAt} editedAt={edited_at} nsfw={nsfw} spoiler={spoiler} />
                        </div>

                        <h1 className="text-xl font-semibold">{title}</h1>

                        <p className="whitespace-break-spaces">{body}</p>

                    </section>

                    <section className="sm:px-4 my-2 w-full max-w-[400px] aspect-square mx-auto sm:border border-gray20">
                        <FramesCarousel className="sm:rounded-md" frames={frames} />
                    </section>

                    <LinksSection links={links} />
                </article>

                <div className="px-4 flex items-center gap-3">
                    <ReactionButton uid={uid} id={_id} count={reaction_count} />

                    <SaveButton author={user_id} uid={uid} type="Post" count={saved_count} id={_id} />

                    <div className="flex gap-2 text-sm items-center">
                        <span><CommentIcon /></span>
                        <span>{numberConverter(comment_count)}</span>
                    </div>

                    <button className="py-1 space-x-2 hover:bg-[var(--gray10)]" onClick={handleQuote}>
                        <QuoteIcon />
                        <span>Quote</span>
                    </button>
                </div>

            </>
        )
    }

    return <GenericWrapper
        component={Component}
        getQueryProps={getQueryProps}
        props={props}
    />
}

export default PostHeader;