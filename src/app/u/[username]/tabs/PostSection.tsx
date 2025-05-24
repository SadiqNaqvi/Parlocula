"use client";

import { InfiniteScroller } from "@components";
import { PostTile } from "@components/ui";
import { getPostsOfUser } from "@lib/helpers/common";
import { getQueryKeys, queryFunction } from "@lib/utils";

type Props = {
    username: string,
    page: number,
    filter: string
}

const PostSection = ({ username, filter, page }: Props) => {

    const notFoundMessage =
    {
        title: "Nothing to see here",
        paras: [`${username} haven't posted anything`]
    };


    return (
        <InfiniteScroller
            initialPage={page}
            queryKeys={getQueryKeys("postsOfUser_username_filter_page", { username, filter, page })}
            fetchData={(p) => queryFunction(getPostsOfUser, [username, p, filter])}
            Component={PostTile}
            notFoundMessage={notFoundMessage}
        />
    )
}

export default PostSection;