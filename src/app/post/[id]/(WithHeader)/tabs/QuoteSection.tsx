"use client";

import { InfiniteScroller } from "@components";
import { PostBar } from "@components/ui";
import { getQuotesOfPost } from "@lib/helpers/common";
import { getQueryKeys } from "@lib/utils";

const QuoteSection = ({ id, page, allowNsfw }: { id: string, page: number, allowNsfw: boolean }) => {

    const nFM = {
        title: "No Quotes of this post",
        paras: ["Be the first to quote this post."]
    }

    return (
        <InfiniteScroller
            Component={PostBar}
            fetchData={(p) => getQuotesOfPost(id, p, allowNsfw)}
            queryKeys={getQueryKeys("quotes_pid", { pid: id })}
            initialPage={page}
            notFoundMessage={nFM}
        />
    )

}

export default QuoteSection;