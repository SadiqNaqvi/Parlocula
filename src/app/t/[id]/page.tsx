import Navbar from "@app/explore/(withoutSidebar)/exploreComponents/Navbar"
import { DynamicComponent, Navigate, Tabs } from "@components"
import { getFramesOfThread, getLinksOfThread, getPostsOfThread, getThreadById } from "@lib/actions/actions"
import { getInternalPoster, isValidObjectId, numberConverter, refineSearchParams, timeAgo } from "@lib/utils"
import { GeneralGetReturn, GeneralMultipleReturn, Thread } from "@type/internal"
import { Metadata } from "next"
import Image from "next/image"
import { FramesTab, JoinButton, LinksTab, PostsTab } from "./"

export const generateMetadata = async ({ params }: { params: { id: string } }): Promise<Metadata> => {
    const thread_id = params.id.split('-')[0];
    if (!isValidObjectId(thread_id))
        return { title: "Popcorn Paragon" }

    const { success, result } = await getThreadById(thread_id);
    if (!success || !result) return { title: "Popcorn Paragon" }
    const { name, description } = result;
    return { title: `${name} - Thread - Popcorn Paragon`, description };
}

const funcMap: Record<string, (tid: string, p: number, f: string) => Promise<GeneralMultipleReturn>> = {
    posts: getPostsOfThread,
    frames: getFramesOfThread,
    links: getLinksOfThread,
}

type Props = { params: { id: string }, searchParams: { p?: string, t?: string, f?: string } }

const getThreadAndPosts = async ({ params, searchParams }: Props): Promise<GeneralGetReturn> => {
    const tid = params.id.split('-')[0];
    const { filter, page } = refineSearchParams("posts", searchParams.p, searchParams.f)
    const { result, errCode, success } = await getThreadById(tid);
    if (!success || !result)
        return { success, errCode }
    // else if (!result.post_count) return {
    //     success: true, errCode: null,
    //     result: { thread: result, initialData: null }
    // }
    const tab = searchParams.t
    const correctTab = tab && ["posts", "frames", "links"].includes(tab) ? tab : "posts";
    const initialDataFunc = funcMap[correctTab] ?? getPostsOfThread;
    const data = await initialDataFunc(tid, page, filter);
    const initialData = {
        posts: correctTab === "posts" ? data.result : null,
        frames: correctTab === "frames" ? data.result : null,
        links: correctTab === "links" ? data.result : null,
    }
    return {
        result: { thread: result, initialData },
        success: true
    };
}

const options = { aspect_ratio: "1.0", crop: "thumb", w: 128 };

const Page = DynamicComponent((data: any, { searchParams }: Props) => {

    const { filter, page } = refineSearchParams("posts", searchParams.p, searchParams.f)

    const { thread, initialData } = data;

    const { _id, connection, createdAt, created_by, description, links, member_count, nsfw, poster, post_count, name, updatedAt } = thread as Thread;

    const tabs = [
        { Label: "Posts", tab_id: "posts", Component: <PostsTab id={_id} filter={filter} page={page} post_count={2} initialData={initialData} /> },
        { Label: "Frames", tab_id: "frames", Component: <FramesTab id={_id} filter={filter} page={page} post_count={2} initialData={initialData} /> },
        { Label: "Links", tab_id: "links", Component: <LinksTab id={_id} filter={filter} page={page} post_count={2} initialData={initialData} /> },
    ]

    return (
        <>
            <Navbar classnames="sticky bg-primary -mt-4 mb-4" />
            <header className="flex flex-col md:flex-row mb-4">
                <div>
                    <Image
                        priority
                        className="size-32 object-cover rounded-full"
                        src={getInternalPoster({ path: poster, options })}
                        height={128} width={128}
                        alt="Poster"
                    />

                    <h1 className="text-2xl mt-3 sm:text-4xl uppercase font-semibold">{name}</h1>
                    <ul className="flex space-x-3 text-xs text-zinc-500">
                        <li>
                            <Navigate comp="link" goto={`${_id}/members`}>{numberConverter(member_count)} Members</Navigate>
                        </li>
                        <li className="list-[circle]">{timeAgo(createdAt)}</li>
                    </ul>
                    <p className="mt-2 line-clamp-2">{description}</p>

                </div>

                <div className="mt-4 md:mt-0 md:ml-auto">
                    <JoinButton tname={name} tposter={poster} tid={_id} />
                </div>

            </header >
            <Tabs tabs={tabs} currentTab={searchParams.t} />
        </>
    )
}, getThreadAndPosts)

export default Page;