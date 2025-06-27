"use client";

import { InfiniteScroller } from "@components";
import { ThreadTile } from "@components/ui";
import { getThreads } from "@lib/helpers/common";
import { getQueryKeys, queryFunction } from "@lib/utils";

const ThreadList = ({ page, filter }: { page: number, filter: string }) => {
    return <InfiniteScroller
        initialPage={page}
        Component={ThreadTile}
        fetchData={(p) => queryFunction(getThreads, [p, filter], p)}
        queryKeys={getQueryKeys("threads_filter", { filter })}
        notFoundMessage={{ title: "Not even a single thread?", paras: ["Be the first one to create a thread."] }}
    />
}

export default ThreadList;