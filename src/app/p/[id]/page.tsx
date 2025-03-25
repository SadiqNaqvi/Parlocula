import Navbar from "@app/explore/(withoutSidebar)/exploreComponents/Navbar";
import { CommentIcon } from "@assets/Icons";
import { Navigate, DynamicComponent } from "@components";
import { LinkTile } from "@components/ui";
import { getCommentsOnPost, getPostById } from "@lib/actions/actions";
import { getInternalPoster, isValidObjectId, numberConverter, refineSearchParams, timeAgo } from "@lib/utils";
import { FullPost, GeneralGetReturn } from "@type/internal";
import { Metadata } from "next";
import Image from "next/image";
import CommentSection from "./CommentSection";
import Frames from "./Frames";
import ReactionButton from "./ReactionButton";

export const generateMetadata = async ({ params }: { params: { id: string } }): Promise<Metadata> => {
    const id = params.id.split('-')[0];
    if (!isValidObjectId(id)) return { title: "Oops! Wrong Path - Popcorn Paragon" }
    const { result, success } = await getPostById(id);
    if (!success) return { title: "Something wrnt wrong - Popcorn Paragon" }
    const { title, username, body } = result;
    return {
        title: `${title}${username && " - Post by @" + username} - Popcorn Paragon`,
        description: body
    }
}

type PropsType = { params: { id: string }, searchParams: { p?: string, f?: string } };

const getPostAndComments = async ({ params, searchParams }: PropsType): Promise<GeneralGetReturn> => {
    const id = params.id.split('-')[0];
    const { filter, page } = refineSearchParams("comments", searchParams.p, searchParams.f);
    const { errCode, result, success } = await getPostById(id);
    if (!success) return { result, success, errCode }
    // else if (result.comment_count)
    //     return { success: true, errCode: null, result: { post: result, comments: null } }

    const comments = await getCommentsOnPost({ id, page, filter });
    return { success: true, errCode: null, result: { post: result, comments: comments.result } }
}

const Page = DynamicComponent((data, { searchParams }) => {
    const { filter, page } = refineSearchParams("comments", searchParams.p, searchParams.f);
    const { post, comments } = data;
    const { _id, username, user_id, poster, body, comment_count, createdAt, frames, links, nsfw, reaction_count, spoiler, tag, thread_id, title, updatedAt } = post as FullPost;

    const posterOptions = {
        w: "20",
        aspect_ratio: "1",
        crop: "auto"
    }

    return (
        <>
            <Navbar classnames="sticky bg-primary -mt-4 mb-4" />
            <header className="flex gap-2 items-center">
                <Navigate comp="link" role="button" goto={`/t/${thread_id}`}>
                    <Image
                        className="size-8 rounded-full"
                        src={getInternalPoster({ path: poster, options: posterOptions })}
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
                    {createdAt !== updatedAt &&
                        <li className="bg-gray50 rounded-md list-[circle]" title={`Edited at ${new Date(updatedAt).toDateString()}`}>Edited</li>
                    }
                </ul>
                <h1 className="text-xl font-semibold">{title}</h1>
                <p className="whitespace-break-spaces">{body}</p>
                <Frames frames={frames} />
                <ul className="my-4 flex gap-4">
                    {links.map(link => (
                        <li key={link.path}>
                            <LinkTile {...link} />
                        </li>
                    ))}
                </ul>
            </section>
            <section className="mt-2 flex gap-4">
                <ReactionButton id={_id} count={reaction_count} />
                <span className="flex gap-2 p-2 border border-gray-500 border-opacity-30 rounded-md">
                    <CommentIcon classnames="size-4" />
                    {numberConverter(comment_count)}
                </span>
            </section>
            <CommentSection post_author={user_id} comment_count={comment_count} initialData={comments} filter={filter} id={_id} page={page} />
        </>
    )
}, getPostAndComments);

export default Page;