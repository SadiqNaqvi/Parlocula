"use client";

import { ReactIcon } from "@assets/Icons";
import { UserBasedButton } from "@components";
import BottomSheet, { BottomSheetRef } from "@components/BottomSheet";
import { addReactionOnPost, removeReactionOnPost } from "@lib/helpers/client";
import { getReactionOnPost } from "@lib/helpers/common";
import { getQueryKeys, numberConverter, queryFunction } from "@lib/utils";
import { MutationFnProps, UserBasedButtonProps } from "@type/other";
import EmojiPicker, { Emoji, EmojiClickData, Theme } from "emoji-picker-react";
import { useRef } from "react";

const ReactionButton = ({ id, count, uid }: { id: string, count: number, uid: string | undefined }) => {

    const sheetRef = useRef<BottomSheetRef>();

    const mutationFn = async ({ newState, action, user_id }: MutationFnProps<string>) => {
        if (action === "react") await addReactionOnPost(user_id, id, newState);
        else await removeReactionOnPost(id, user_id);
    }

    const Button = ({ onClick, state }: UserBasedButtonProps<string>) => {

        const handleReactionClick = (el: EmojiClickData) => {
            const unified = el.unified;
            if (state === unified) onClick(unified, "remove");
            else onClick(unified, "react");
            sheetRef.current?.close();
        }

        return (
            <span className="flex gap-2 items-center text-sm">
                <BottomSheet
                    button={
                        <>
                            <span>
                                {state ? <Emoji unified={state} size={18} /> : <ReactIcon />}
                            </span>
                            <span>
                                {numberConverter(count + (state ? 1 : 0))}
                            </span>
                        </>
                    }
                    className="flex gap-2"
                >
                    <EmojiPicker
                        theme={Theme.DARK}
                        previewConfig={{ showPreview: false, }}
                        className="w-full max-w-md bg-primary"
                        lazyLoadEmojis
                        onEmojiClick={handleReactionClick}
                        reactionsDefaultOpen />
                </BottomSheet>
            </span>
        )
    }

    return <UserBasedButton
        uid={uid}
        className="flex p-2 border border-gray-500 border-opacity-30 rounded-md"
        Button={Button}
        mutationFn={mutationFn}
        queryFn={(uid) => queryFunction(getReactionOnPost, [id, uid])}
        queryKeys={getQueryKeys("reaction_pid", { pid: id })}
    />
}
export default ReactionButton;