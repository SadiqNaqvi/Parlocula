"use client";

import CommentInput from "@components/CommentInput";
import { InfiniteScroller } from "@components";
import { CommentTile } from "@components/ui";
import { getCommentById, getRepliesOnComment } from "@lib/helpers/common";
import { getQueryKeys } from "@lib/utils";
import { useQueryHook } from "@lib/hooks";
import { FullComment } from "@type/internal";

type Props = {
    cid: string,
    post_id: string,
    post_author: string,
    filter: string,
    page: number,
}

const RepliesSection = ({ cid, filter, page }: Props) => {

    const qkeys = getQueryKeys("replies_cid_filter", { cid, filter });

    const { data } = useQueryHook<FullComment>({
        queryFn: () => getCommentById(cid),
        queryKeys: getQueryKeys("comment_cid", { cid })
    });

    if (!data) return null;

    return (
        <>
            <section className="h-stretch">
                <InfiniteScroller
                    Component={CommentTile}
                    fetchData={(p) => getRepliesOnComment(cid, p, filter)}
                    queryKeys={qkeys}
                    initialPage={page}
                />
            </section>

            <CommentInput
                post_author={data.post_author}
                post_id={data.post_id}
                qkeys={qkeys}
            />
        </>
    )
}

export default RepliesSection;