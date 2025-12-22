'use client';

import { CommentInput } from "@components";
import { FullComment } from "@type/internal";

type Props = {
    comment: FullComment
}

const EditComment = ({ comment }: Props) => {

    return (
        <div className="pt-6">
            <CommentInput
                editing
                defaultValue={comment}
                cid={comment._id}
                post_author={comment.post_author}
                post_id={comment.post_id}
                section="comments"
            />
        </div>
    )
};

export default EditComment;