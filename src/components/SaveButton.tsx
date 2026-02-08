"use client";

import { BookmarkFillIcon, BookmarkIcon } from "@assets/Icons";
import { UserBasedButton } from "@components";
import { checkIfItemSaved } from "@lib/helpers/common";
import { getQueryKeys, numberConverter } from "@lib/utils";
import { LoadingButton, UserBasedButtonProps } from "./UserBasedButton";
import { OptionalChildren } from "./ui";

type Props = {
    id: string,
    uid: string | undefined,
    count: number | undefined,
    type: "Post" | "Comment" | "Shelf",
    author: string,
    className?: string,
}

const NoUserStateButton = ({ count, type }: Pick<Props, "type" | "count">) => (
    <>
        <BookmarkIcon />
        <span>
            <OptionalChildren condition={type !== "Shelf"} fallback="Save">
                {numberConverter((count || 0))}
            </OptionalChildren>
        </span>
    </>
)

const SaveButton = ({ id, count, type, uid, author, className }: Props) => {

    const Button = ({ onClick, state, user_id }: UserBasedButtonProps<boolean>) => {

        const handleClick = () => {
            if (state) {
                onClick(false, "unsave_content", [id, user_id]);
            } else {
                onClick(true, "save_content", [
                    { content_author: author, content_id: id, content_type: type },
                    user_id
                ])
            }
        }

        return (
            <button className={className} onClick={handleClick}>
                <span>
                    {state ? <BookmarkFillIcon /> : <BookmarkIcon />}
                </span>
                <span>
                    <OptionalChildren condition={type !== "Shelf"} fallback={state ? "Saved" : "Save"}>
                        {numberConverter((count || 0) + (state ? 1 : 0))}
                    </OptionalChildren>
                </span>
            </button>
        )
    };

    return (
        <UserBasedButton
            uid={uid}
            Loading={<LoadingButton primary={false} />}
            noUserStateChilren={<NoUserStateButton count={count} type={type} />}
            redirectAfterLogin={`/${type.toLocaleLowerCase()}/${id}`}
            errorStateClassName="flex p-2 border border-gray-500 border-opacity-30 rounded-md"
            noUserStateClassName="secondary"
            Button={Button}
            queryFn={(uid) => checkIfItemSaved(id, uid)}
            queryKeys={getQueryKeys("isContentSaved_type_id", { type: type.toLowerCase(), id })}
        />
    )
}
export default SaveButton;