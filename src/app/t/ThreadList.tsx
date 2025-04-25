"use client";

import { InfiniteScroller } from "@components";
import { ThreadTile } from "@components/ui";
import { getThreads } from "@lib/helpers/common";
import { infiniteScrollerResponse } from "@lib/utils";

const fetchData = async (page: number, filter: string) => {
    const { errCode, result, success } = await getThreads(page, filter);
    if (!success) throw new Error(errCode);
    return infiniteScrollerResponse(result, page);
}

const ThreadList = ({ initialData, page, filter }: { initialData?: { data: any[], total: number }, page: number, filter: string }) => {
    return <InfiniteScroller
        initialData={initialData}
        initialPage={page}
        Component={ThreadTile}
        fetchData={(p) => fetchData(p, filter)}
        queryKeys={[`${page}`, `${filter}-threads`]}
        notFoundMessage={{ title: "Not even a single thread?", paras: ["Be the first one to create a thread."] }}
    />
}

export default ThreadList;