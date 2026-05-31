"use client";

import { ThumbUpIcon, ThumbUpIconFill } from "@assets/Icons";
import UserBasedButton, { UserBasedButtonProps } from "@components/UserBasedButton";
import { checkLikeOnComment } from "@lib/helpers/common";
import { getQueryKeys, numberConverter } from "@lib/utils";

const NoUserStateButton = ({ count }: { count: number }) => (
    <>
        <ThumbUpIcon />
        <span>
            {count ? numberConverter(count) : 0}
        </span>
    </>
)

const LoadingButton = () => (
    <span>
        <span className="size-8 animate-spin"></span>
    </span>
)

const className = "flex py-2 px-3 gap-2 items-center border border-gray20 rounded-full";

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
            <button
                title="Like Button"
                className={className}
                onClick={handleClick

                }>
                {state ? <ThumbUpIconFill /> : <ThumbUpIcon />}
                <span>
                    {numberConverter(likesCount + (state ? 1 : 0))}
                </span>
            </button>
        )
    };

    return (
        <UserBasedButton
            uid={uid}
            Button={Button}
            noUserStateChilren={<NoUserStateButton count={likesCount} />}
            noUserStateClassName={className}
            redirectAfterLogin={`/c/${id}`}
            queryFn={(uid) => checkLikeOnComment(id, uid)}
            queryKeys={getQueryKeys("like_cid", { cid: id })}
            errorStateClassName="inline p-1 border border-gray20 rounded-lg"
            Loading={<LoadingButton />}
        />
    )
}

export default LikeButton;