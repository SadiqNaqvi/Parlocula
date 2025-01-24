import InfiniteScroller from "./InfiniteScroller";
import LoadingSpinner from "./ui/LoadingSpinner";
import { PostTile, NotFound } from "@components/ui";
import { isValidObjectId } from "@lib/utils";
import { GeneralMultipleReturn } from "@type/internal";
import { paginatedQueryLimit } from "@lib/constants";

const fetchInitialData = async (uid: string): Promise<any[] | null> => {
    try {
        const response: GeneralMultipleReturn = await fetch(`${process.env.__NEXT_PRIVATE_ORIGIN || ""}/api/user/${uid}/posts?page=1`, {
            next: {
                revalidate: 60 * 60 * 24 * 7,
                tags: [`posts-of-${uid}`]
            }
        }).then(res => res.json());

        if (response.success) return response.result.data;
        return null;
    } catch (err) {
        console.log("Error fetching initial post data of user:", err);
        return null;
    }
}

const UserPost = async ({ uid, postCount, isCurrentUser = false }: { uid: string, postCount: number, isCurrentUser: boolean }) => {

    if (!isValidObjectId(uid))
        return (
            <NotFound title="Looks like you come across a wrong way" paragraph={["Please go back and try again"]} />
        )

    const notFoundMessage = isCurrentUser ? { heading: "Create your first post", paras: ["Click on the add icon and start posting."] } : { heading: "Nothing to see here", paras: ["The person has not posted anyhting yet"] };

    if (!postCount)
        return (
            <section className="size-full flex flex-cntr-all">
                <NotFound title={notFoundMessage.heading} paragraph={notFoundMessage.paras} />
            </section>
        )

    const initialData = await fetchInitialData(uid);

    if (initialData?.length) return (
        <section className="size-full flex flex-cntr-all">
            <NotFound title={notFoundMessage.heading} paragraph={notFoundMessage.paras} />
        </section>
    )

    const initialPage = initialData && initialData.length ? 2 : 1;

    const fetchData = async (page = initialPage) => {
        const response: GeneralMultipleReturn = await fetch(`${process.env.__NEXT_PRIVATE_ORIGIN || ""}/api/user/${uid}/posts?page=${page}`, {
            next: {
                revalidate: 60 * 60 * 24 * 7,
                tags: [`posts-of-${uid}`]
            }
        })
            .then(res => res.json());

        if (!response.success) throw new Error(response.error);
        const { data, total } = response.result;
        return { results: data, total_pages: Math.ceil(total / paginatedQueryLimit), page, total_results: total }
    }

    return (
        <InfiniteScroller
            initialPage={initialPage}
            initialData={initialData ?? []}
            queryKey={`posts-of-${uid}`}
            fetchData={fetchData}
            Component={PostTile}
            Loading={LoadingSpinner}
            notFoundMessages={notFoundMessage}
        />
    )
}

export default UserPost;