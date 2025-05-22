"use client";

import InfiniteScroller from "@components/InfiniteScroller";
import { FrameTile, PostTile } from "@components/ui";
import { getPostsOfThread } from "@lib/helpers/common";
import { getQueryKeys, queryFunction } from "@lib/utils";

type PostTabProps = {
    id: string,
    page?: number,
    filter: string,
    tag?: string,
}

const PostsSection = ({ id, page = 1, filter, tag }: PostTabProps) => {

    const Component = () => {
        if (tag === "frames") return FrameTile;
        // else if(tag==="links") return LinkList;
        else return PostTile;
    }

    const notFoundMessages = {
        title: tag === "frames" || tag === "links"
            ? `No ${tag} based post found.`
            : "Such an empty thread!",
        paras: ["Be the first to post in this thread"]
    }

    return <InfiniteScroller
        initialPage={page}
        className={tag === "frames" ? "grid grid-cols-3 gap-3" : undefined}
        notFoundMessage={notFoundMessages}
        Component={Component()}
        fetchData={(p) => queryFunction(getPostsOfThread, [id, p, filter, tag], p)}
        queryKeys={getQueryKeys('postsOfThread_tid_filter_page_tag', { tid: id, page, filter, tag: tag ?? "none" })}
    />
}

export default PostsSection;