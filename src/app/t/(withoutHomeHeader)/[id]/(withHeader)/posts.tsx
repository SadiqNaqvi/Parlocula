"use client";

import InfiniteScroller from "@components/InfiniteScroller";
import { FrameTile, PostTile } from "@components/ui";
import { getPostsOfThread } from "@lib/helpers/common";
import { getQueryKeys } from "@lib/utils";

type PostTabProps = {
    id: string,
    page?: number,
    filter: string,
    tag?: string,
}

const PostsSection = ({ id, page = 1, filter, tag }: PostTabProps) => {

    const Component = () => {
        if (tag === "frames") return FrameTile;
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
        fetchData={(p) => getPostsOfThread(id, p, filter, tag)}
        queryKeys={getQueryKeys('postsOfThread_tid_filter_tag', { tid: id, filter, tag: tag ?? "none" })}
    />
}

export default PostsSection;