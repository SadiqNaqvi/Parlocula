"use client";

import { CommentTile, InfiniteScroller } from "@components";
import { getCommentsOfUser } from "@lib/helpers/common";
import { queryFunction } from "@lib/utils";

type Props = {
    username: string,
    isCurrentUser: boolean,
    page: number,
    filter: string
}

const CommentSection = ({ filter, isCurrentUser, page, username }: Props) => {

    const notFoundMessage = isCurrentUser ?
        {
            title: "Create your first comment",
            paras: ["Open a post and start commenting."]
        }
        :
        {
            title: "Nothing to see here",
            paras: ["The user has not commented yet"]
        };


    return (
        <InfiniteScroller
            initialPage={page}
            queryKeys={['comments-of-user', username, page, filter]}
            fetchData={(p) => queryFunction(getCommentsOfUser, [username, p, filter])}
            Component={CommentTile}
            notFoundMessage={notFoundMessage}
        />
    )
}

export default CommentSection