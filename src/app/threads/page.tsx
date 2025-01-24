import { AddIcon } from "@assets/Icons"
import { Navigate } from "@components"
import InfiniteScroller from "@components/InfiniteScroller";
import RouterDropdown from "@components/RouterDropdown";
import ThreadTile from "@components/ThreadTile";
import { NotFound } from "@components/ui";
import { paginatedQueryLimit } from "@lib/constants";
import { getPageParams } from "@lib/utils";
import { GeneralMultipleReturn, InfiniteQueryResponse, MereThread } from "@type/internal";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Threads - Popcorn Paragon",
    description: "Welcome to Threads. Explore the fandom of your favourite movies, shows, celebrities, characters and connect with the die hard fans."
}

const fetchData = async (page: number): Promise<InfiniteQueryResponse<MereThread>> => {
    try {
        const { result, error, success }: GeneralMultipleReturn<MereThread> = await fetch(`${process.env.__NEXT_PRIVATE_ORIGIN}/api/threads`).then(res => res.json());
        if (!success) throw new Error(error);
        const { data, total } = result;
        return { results: data, total_pages: Math.ceil(total / paginatedQueryLimit), page, total_results: total }
    } catch (err) {
        console.error("Error occured while fetching threads", err);
        throw new Error("Looks like your internet connection is not stable. Please check your connection and try again.");
    }
}

const fetchInitialData = async (initialPage: number): Promise<GeneralMultipleReturn<MereThread>> => {
    try {
        return await fetch(`${process.env.__NEXT_PRIVATE_ORIGIN}/api/threads?p=${initialPage}`).then(res => res.json());
    } catch (err) {
        console.error("Error occured while fetching threads", err);
        return { result: null, success: false, error: "Looks like your internet connection is not stable. Please check your connection and try again." };
    }
}

export default async function Page({ searchParams }: any) {

    const page = getPageParams(searchParams?.p);

    const tabs = [
        { label: "Popular", value: "" },
        { label: "Following", value: "following" },
        { label: "Trending", value: "trending" },
        { label: "For you", value: "for-you" },
        { label: "Newest", value: "newest" },
        { label: "oldest", value: "oldest" },
    ];

    const { result, success } = await fetchInitialData(page);

    if (!result?.total) return <NotFound title="Not even a thread?" paragraph={["Be the first to create thread."]} />

    if (result?.total && !result?.data.length) return <NotFound title="You've came across too far" paragraph={["Please go back and try again."]} />

    const initialData = success ? result.data : [];
    const initialPage = success ? page + 1 : page;

    return (
        <>
            <header className="py-8">
                <h1 className="text-6xl text-center uppercase font-semibold">Welcome to Threads</h1>
                <p className="text-zinc-500 text-center mt-2">Explore the fandom of your favourite movies, shows, celebrities, characters and connect with the die hard fans.</p>
            </header>
            <section className="flex flex-cntr-between sticky top-0 bg-primary py-2">
                <RouterDropdown tabs={tabs} />
                <Navigate comp="link" goto="/threads/new">
                    <AddIcon />
                </Navigate>
            </section>
            <section className="mt-4">
                <InfiniteScroller
                    initialData={initialData}
                    initialPage={initialPage}
                    Component={ThreadTile}
                    fetchData={fetchData}
                    queryKey="hot-threads"
                    notFoundMessages={{ heading: "Not even a single thread?", paras: ["Be the first one to create a thread."] }}
                />
            </section>
        </>
    )

}