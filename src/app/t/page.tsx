import { AddIcon } from "@assets/Icons";
import { Navigate, RouterDropdown } from "@components";
import { NotFound } from "@components/ui";
import { getThreads } from "@lib/helpers/common";
import { queryFilters } from "@lib/constants";
import { MereThread } from "@type/internal";
import { Metadata } from "next";
import ThreadList from "./ThreadList";
import { refineSearchParams } from "@lib/utils";

export const metadata: Metadata = {
    title: "Threads - Popcorn Paragon",
    description: "Welcome to Threads. Explore the fandom of your favourite movies, shows, celebrities, characters and connect with the die hard fans."
}

const fetchInitialData = async (page: number, filter: string): Promise<{ data: MereThread[], total: number } | undefined> => {
    const { result, success } = await getThreads(page, filter);
    if (!success) return;
    return result;
}

const ThreadHeader = () => (
    <>
        <header className="py-8">
            <h1 className="text-6xl text-center uppercase font-semibold">Welcome to Threads</h1>
            <p className="text-zinc-500 text-center mt-2">Explore the fandom of your favourite movies, shows, celebrities, characters and connect with the die hard fans.</p>
        </header>
        <section className="flex flex-cntr-between sticky top-0 pb-4 border-b border-gray40 bg-primary py-2">
            <RouterDropdown tabs={queryFilters.threads} />
            <Navigate comp="link" goto="/t/new">
                <AddIcon />
            </Navigate>
        </section>
    </>
)

export default async function Page({ searchParams }: { searchParams: { p?: string, f?: string } }) {

    const { filter, page } = refineSearchParams("threads", searchParams.p, searchParams.f)

    const initialData = await fetchInitialData(page, filter);

    if (initialData && !initialData.total) return (
        <>
            <ThreadHeader />
            <NotFound title="Not even a thread? lala" paras={["Be the first to create a thread."]} />
        </>
    )

    return (
        <>
            <ThreadHeader />
            <section className="mt-4">
                <ThreadList page={page} filter={filter} initialData={initialData} />
            </section>
        </>
    )

}