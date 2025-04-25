"use client";

import { InfiniteScroller } from "@components";
import { NotFound, PostTile } from "@components/ui";
import { getPostsOfThread } from "@lib/helpers/common";
import { infiniteScrollerResponse } from "@lib/utils";

const notFoundMessages = {
    title: "Such an empty thread!",
    paras: ["Be the first to post in this thread"]
}

const fetchData = async (id: string, page: number, filter: string) => {
    const { errCode, result, success } = await getPostsOfThread(id, page, filter);
    if (!success) throw new Error(errCode);
    return infiniteScrollerResponse(result, page);
}

type PostTabProps = {
    id: string,
    page?: number,
    filter: string,
    post_count: number;
    initialData: {
        links: any
    } | null
}

const LinksTab = ({ id, page = 1, filter, post_count, initialData }: PostTabProps) => {

    const initialLinksData = initialData?.links;

    if (!post_count || (initialLinksData && !initialLinksData.total))
        return <NotFound {...notFoundMessages} />

    return <InfiniteScroller
        initialData={initialLinksData}
        initialPage={page}
        notFoundMessage={notFoundMessages}
        Component={PostTile}
        fetchData={(p) => fetchData(id, p, filter)}
        queryKeys={[`${page}`, `${filter}-posts-thread-${id}`]}
    />
}

export default LinksTab;