"use client";

import InfiniteScroller from "@components/InfiniteScroller";
import { FrameTile, NotFound } from "@components/ui";
import { getFramesOfThread } from "@lib/helpers/common";
import { infiniteScrollerResponse } from "@lib/utils";

const notFoundMessages = {
    title: "Looks like nobody has posted anything yet",
    paras: ["Be the first to post in this thread"]
}

const fetchData = async (id: string, page: number, filter: string) => {
    const { errCode, result, success } = await getFramesOfThread(id, page, filter);
    if (!success) throw new Error(errCode);
    return infiniteScrollerResponse(result, page);
}

type PostTabProps = {
    id: string,
    page?: number,
    filter: string,
    post_count: number;
    initialData: {
        frames: any
    } | null
}

const FramesTab = ({ id, page = 1, post_count, filter, initialData }: PostTabProps) => {

    const initialFramesData = initialData?.frames;

    if (!post_count || (initialFramesData && !initialFramesData.total))
        return <NotFound {...notFoundMessages} />

    return <InfiniteScroller
        initialData={initialFramesData}
        initialPage={page}
        notFoundMessage={notFoundMessages}
        Component={FrameTile}
        fetchData={(p) => fetchData(id, p, filter)}
        queryKeys={[`${filter}-frames-thread-${id}`, `${page}`]}
    />
}

export default FramesTab;