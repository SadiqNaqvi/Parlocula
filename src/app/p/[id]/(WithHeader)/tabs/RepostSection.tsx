"use client";

import { InfiniteScroller } from "@components";
import { PostTile } from "@components/ui";
import { getReposts } from "@lib/helpers/common";
import { getQueryKeys, queryFunction } from "@lib/utils";

const RepostSection = ({ id, page }: { id: string, page: number }) => {

    const nFM = {
        title: "No Reposts of this post",
        paras: ["Be the first to repost this post."]
    }

    return (
        <InfiniteScroller
            Component={PostTile}
            fetchData={() => queryFunction(getReposts, [id, page])}
            queryKeys={getQueryKeys("reposts_pid_page", { pid: id, page })}
            notFoundMessage={nFM}
        />
    )

}

export default RepostSection;