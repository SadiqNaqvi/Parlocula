"use client";

import { ThumbUpIcon, ThumbUpIconFill } from "@assets/Icons";
import UserBasedButton, { UserBasedButtonProps } from "@components/UserBasedButton";
import { checkLikeOnComment } from "@lib/helpers/common";
import { getQueryKeys, numberConverter } from "@lib/utils";

const LikeButton = ({ id, likesCount, author, uid }: { id: string, likesCount: number, author: string, uid: string | undefined }) => {

    const Button = ({ onClick, state, user_id }: UserBasedButtonProps<boolean>) => {

        const handleClick = () => {
            if (state) {
                onClick(false, "dislike_comment", [id, user_id])
            }
            else {
                onClick(true, "like_comment", [id, user_id, { comment_author: author }])
            }
        }

        return (
            <div className="inline-flex p-2 border border-gray20 rounded-lg">

                <button className="pr-2 smallBtn" onClick={handleClick}>
                    {state ? <ThumbUpIconFill /> : <ThumbUpIcon />}
                </button>

                <span className="px-2 border-x border-gray20">
                    {numberConverter(likesCount + (state ? 1 : 0))}
                </span>
            </div>
        )
    };

    return <UserBasedButton
        uid={uid}
        Button={Button}
        queryFn={(uid) => checkLikeOnComment(id, uid)}
        queryKeys={getQueryKeys("like_cid", { cid: id })}
        className="inline p-1 border border-gray20 rounded-lg"
        Loading={(
            <span>
                <span className="size-8 animate-spin"></span>
            </span>
        )}
    />
}

export default LikeButton;