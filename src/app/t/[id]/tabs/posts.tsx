"use client";

import InfiniteScroller from "@components/InfiniteScroller";
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
        posts: any
    } | null
}

const PostsTab = ({ id, page = 1, filter, post_count, initialData }: PostTabProps) => {

    const initialPostData = initialData?.posts;

    if (!post_count || (initialPostData && !initialPostData.total))
        return <NotFound {...notFoundMessages} />

    return <InfiniteScroller
        initialData={initialPostData}
        initialPage={page}
        notFoundMessage={notFoundMessages}
        Component={PostTile}
        fetchData={(p) => fetchData(id, p, filter)}
        queryKeys={[`${page}`, `${filter}-posts-thread-${id}`]}
    />
}

export default PostsTab;