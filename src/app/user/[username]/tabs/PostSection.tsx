"use client";

import { InfiniteScroller } from "@components";
import { PostBar } from "@components/ui";
import { getPostsOfUser } from "@lib/helpers/common";
import { getQueryKeys } from "@lib/utils";
import useCurrentUser from "@store/user";

type Props = {
    username: string,
    uid: string,
    page: number,
    filter: string,
    allowNsfw: boolean
}

const PostSection = ({ username, uid, filter, page, allowNsfw }: Props) => {

    const { meta } = useCurrentUser();

    const notFoundMessage =
    {
        title: "Nothing to see here",
        paras: [
            meta && meta.user_id === uid ?
                "Maybe it's time for you to start posting" :
                `${username} haven't posted anything`
        ]
    };


    return (
        <InfiniteScroller
            initialPage={page}
            queryKeys={getQueryKeys("postsOfUser_uid_filter", { uid, filter })}
            fetchData={(p) => getPostsOfUser(uid, p, allowNsfw, filter)}
            additional={{ section: "user" }}
            Component={PostBar}
            notFoundMessage={notFoundMessage}
        />
    )
}

export default PostSection;