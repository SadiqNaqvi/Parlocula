"use client";

import { InfiniteScroller } from "@components";
import { CommentBar } from "@components/ui";
import { getCommentsOfUser } from "@lib/helpers/common";
import { getQueryKeys } from "@lib/utils";
import useCurrentUser from "@store/user";

type Props = {
    uid: string,
    page: number,
    filter: string,
    allowNsfw: boolean
}

const CommentSection = ({ filter, page, uid, allowNsfw }: Props) => {

    const { meta } = useCurrentUser();

    const notFoundMessage = meta?.user_id === uid ?
        {
            title: "Create your first comment",
            paras: ["Open a post and start commenting."]
        } : {
            title: "Nothing to see here",
            paras: ["The user has not made any comments yet"]
        };

    return (
        <InfiniteScroller
            initialPage={page}
            queryKeys={getQueryKeys("commentsOfUser_uid_filter", { uid, filter })}
            fetchData={(p) => getCommentsOfUser(uid, p, allowNsfw, filter)}
            Component={CommentBar}
            notFoundMessage={notFoundMessage}
        />
    )
}

export default CommentSection