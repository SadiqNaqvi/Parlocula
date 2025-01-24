import Navbar from "@app/explore/exploreComponents/Navbar"
import { Navigate, Tabs } from "@components"
import { NotFound, ShowError } from "@components/ui"
import placeholder from "@assets/placeholder.png"
import { getInternalPoster, getPageParams, isValidObjectId } from "@lib/utils"
import Image from "next/image"
import { Metadata } from "next"
import { GeneralSingleReturn, Thread } from "@type/internal"
import JoinButton from "./JoinButton"
import PostsTab from "./tabs/posts"
import MediaTab from "./tabs/media"

const fetchData = async (id: string): Promise<GeneralSingleReturn<Thread>> => {
    try {
        return await fetch(`${process.env.__NEXT_PRIVATE_ORIGIN}/api/threads/${id}`).then(res => res.json());
    } catch (err) {
        console.log(err);
        return {
            result: null,
            error: "Looks like your internet connection is not stable! Please check your connection and try again.",
            success: false
        };
    }
}

export const generateMetadata = async ({ params }: { params: { id: string } }): Promise<Metadata> => {
    const thread_id = params.id.split('-')[0];
    if (!isValidObjectId(thread_id))
        return { title: "Road Block! - Popcorn Paragon" }

    const { success, result } = await fetchData(thread_id);
    if (!success || !result) return { title: "Popcorn Paragon" }
    const { title, description } = result;
    return { title: `${title} - Popcorn Paragon`, description };
}

export default async function Page({ params, searchParams }: { params: { id: string }, searchParams: { p: string | null } }) {
    const page = getPageParams(searchParams.p)

    const thread_id = params.id.split('-')[0];

    if (!isValidObjectId(thread_id))
        return (
            <div className="size-full flex flex-cntr-all">
                <section className="space-y-4">
                    <h2 className="text-3xl">Oops! Looks like you came across a wrong way.</h2>
                    <p className="text-zinc-500 text-center">Here, take my hand. Let's explore the vast world of threads together.</p>
                    <Navigate
                        comp="link"
                        goto="/threads"
                        type="button"
                        className="px-4 inline-flex py-3 rounded-md bg-secondary mt-4 mx-auto">
                        Explore Threads
                    </Navigate>
                </section>
            </div>
        )

    const { result, success, error } = await fetchData(thread_id);
    if (!success) return <ShowError heading={"Unable to get the resourse you're looking for"} paras={[error]} />

    if (!result) return <NotFound title="No Thread found" paragraph={["Reason: You came across a wrong way or Thread might have been deleted.", "Please search the thread by it's name."]} />

    const posterOptions = { aspect_ratio: 1.0, crop: "thumb", width: 128 };
    const tabs = [
        { Label: "Posts", Component: <PostsTab id={result._id} page={page} /> },
        { Label: "Frames", Component: <MediaTab id={result._id} /> },
    ]

    return (
        <>
            <Navbar classnames="sticky bg-primary -mt-4 mb-4" />
            <header className="flex gap-4 pb-6 border-b border-gray40">
                <Image
                    priority
                    className="size-32 object-cover rounded-full"
                    src={result.poster ? getInternalPoster(result.poster, posterOptions) : placeholder}
                    height={128} width={128}
                    alt="Poster"
                />
                <div className="my-auto">
                    <h1 className="text-2xl sm:text-4xl uppercase font-semibold">{result.title}</h1>
                    <Navigate comp="link" goto={`${params.id}/users`} className="text-sm text-zinc-500">{result.members_count} People</Navigate>
                    <p className="mt-2 line-clamp-2">{result.description}</p>
                </div>
                <div className="ml-auto">
                    <JoinButton tid={result._id} />
                </div>
            </header>
            <Tabs tabs={tabs} />
        </>
    )
}