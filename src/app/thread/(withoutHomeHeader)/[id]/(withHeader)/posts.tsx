"use client";

import InfiniteScroller from "@components/InfiniteScroller";
import { FrameTile, PostBar } from "@components/ui";
import { getPostsOfThread } from "@lib/helpers/common";
import { getQueryKeys } from "@lib/utils";

type PostSectionProps = {
    id: string,
    page?: number,
    filter: string,
    category?: string,
    section: "posts" | "frames" | "links",
    allowNsfw: boolean,
}

const PostsSection = ({ id, page = 1, filter, category, section, allowNsfw }: PostSectionProps) => {

    const Component = () => {
        if (section === "frames") return FrameTile;
        else return PostBar;
    }

    const notFoundMessages = {
        title: section === "frames" || section === "links"
            ? `No posts found with ${section}.`
            : "Such an empty thread!",
        paras: ["Be the first to post in this thread"]
    }

    return (
        <InfiniteScroller
            initialPage={page}
            className={category === "frames" ? "grid grid-cols-3 gap-3" : undefined}
            notFoundMessage={notFoundMessages}
            additional={{ section: "thread" }}
            Component={Component()}
            fetchData={(p) => getPostsOfThread(id, p, allowNsfw, filter, section, category)}
            queryKeys={getQueryKeys('postsOfThread_tid_filter_category', { tid: id, filter, category: category ?? "none" })}
        />
    )
}

export default PostsSection;