import InfiniteScroller from "@components/InfiniteScroller";
import { LoadingSpinner, NotFound, PostTile } from "@components/ui";
import { paginatedQueryLimit } from "@lib/constants";
import { isValidObjectId } from "@lib/utils";
import { GeneralMultipleReturn, InfiniteQueryResponse } from "@type/internal";

const Loading = () => (
    <div className="my-6">
        <LoadingSpinner />
    </div>
)

const notFoundMessages = {
    heading: "Looks like nobody has posted anything yet",
    paras: ["Be the first to post in this thread"]
}

const fetchInitialData = async (id: string, page: number): Promise<{ result: any[], total: number } | null> => {
    try {
        const { result, success }: GeneralMultipleReturn = await fetch(`/api/threads/${id}/posts?p=${page}`, {
            next: {
                revalidate: 0,
                tags: [`posts-of-thread:${id}`],
            }
        }).then(res => res.json());
        if (!success) return null;
        const { data, total } = result;
        return { result: data, total };
    } catch (err) {
        console.error(err);
        return null;
    }
}

const PostsTab = async ({ id, page = 1 }: { id: string, page?: number }) => {

    if (!isValidObjectId(id))
        return (
            <section className="my-6">
                <h3 className="text-2xl text-center">Looks like you have lost your way.</h3>
                <p className="text-center-text-zinc-">Here, take my hand. Let's explore the vast world of threads on Popcorn Paragon.</p>
            </section>
        )

    const response = await fetchInitialData(id, page);

    if (!response?.total) return <NotFound title="Looks like you entered an empty room" paragraph={["Be the first to post in this thread."]} />

    if (response?.total && !response?.result.length) return <NotFound title="You've came across too far" paragraph={["Please go back and try again."]} />

    const initialData = response ? response.result : [];
    const initialPage = initialData.length ? page + 1 : page;

    const fetchData = async (page = 1): Promise<InfiniteQueryResponse> => {
        const { error, result, success }: GeneralMultipleReturn = await fetch(`/api/threads/${id}/posts?p=${page}`, {
            next: {
                revalidate: 0,
                tags: [`posts-of-thread:${id}`],
            }
        }).then(res => res.json());
        if (!success) throw new Error(error);
        const { data, total } = result;
        return { results: data, total_results: total, total_pages: Math.ceil(total / paginatedQueryLimit), page };
    }

    return (
        <section className="">
            <InfiniteScroller
                initialData={initialData}
                initialPage={initialPage}
                notFoundMessages={notFoundMessages}
                Loading={Loading}
                Component={PostTile}
                fetchData={fetchData}
                queryKey={`posts-of-thread:${id}`}
            />
        </section>
    )
}

export default PostsTab;