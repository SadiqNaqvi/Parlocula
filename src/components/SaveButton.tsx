"use client";

import { BookmarkFillIcon, BookmarkIcon } from "@assets/Icons";
import { UserBasedButton } from "@components";
import { saveItem, unsaveItem } from "@lib/helpers/client";
import { checkIfItemSaved } from "@lib/helpers/common";
import { getQueryKeys, numberConverter, queryFunction } from "@lib/utils";
import { MutationFnProps, UserBasedButtonProps } from "@type/other";

const SaveButton = ({ id, count, type }: { id: string, count: number, type: "Post" | "Comment" | "List" }) => {

    const mutationFn = async ({ action, user_id }: MutationFnProps<string>) => {
        if (action === "save")
            await saveItem({
                content_id: id,
                content_type: type,
                content_author: user_id
            }, user_id);
        else await unsaveItem(id, user_id);
    }

    const Button = ({ onClick, state }: UserBasedButtonProps<boolean>) => (
        <button className="space-x-2" onClick={() => onClick(!state, state ? "unsave" : "save")}>
            <span>{state ? <BookmarkFillIcon /> : <BookmarkIcon />}</span>
            {type === "List" ?
                <span>{state ? "Saved" : "Save"}</span>
                :
                <span>{numberConverter(count + (state ? 1 : 0))}</span>
            }
        </button>
    );

    return <UserBasedButton
        Loading={<></>}
        className="flex p-2 border border-gray-500 border-opacity-30 rounded-md"
        Button={Button}
        mutationFn={mutationFn}
        queryFn={(uid) => queryFunction(checkIfItemSaved, [id, uid])}
        queryKeys={getQueryKeys("isContentSaved_type_id", { type: type.toLowerCase(), id })}
    />
}
export default SaveButton;