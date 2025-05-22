"use client";

import { UserBasedButton } from "@components";
import { closeFancyBox } from "@components/Modal";
import { addReactionOnPost, removeReactionOnPost } from "@lib/helpers/client";
import { getReactionOnPost } from "@lib/helpers/common";
import { queryFunction } from "@lib/utils";
import { MutationFnProps, UserBasedButtonProps } from "@type/other";
import { EmojiClickData } from "emoji-picker-react";

const ReactionButton = ({ id, count }: { id: string, count: number }) => {

    const mutationFn = async ({ newState, action, user_id }: MutationFnProps<string>) => {
        if (action === "react") await addReactionOnPost(user_id, id, newState);
        else await removeReactionOnPost(id, user_id);
    }

    const Button = ({ onClick, state }: UserBasedButtonProps<string>) => {

        const handleReactionClick = (el: EmojiClickData) => {

            const unified = el.unified;
            if (state === unified) onClick(unified, "remove");
            else onClick(unified, "react");

            closeFancyBox();
        }

        return (
            <span className="flex p-2 border border-gray30 rounded-md">
                {/* <Modal
                    buttonChildren={
                        <>
                            <span>
                                {state ?
                                    state
                                    // <Emoji unified={state} size={18} />
                                    : "React"
                                }
                            </span>
                            <span>
                                {state ? numberConverter(count) + 1 : numberConverter(count)}
                            </span>
                        </>
                    }
                    id="emoji-picker"
                    className="smallBtn flex gap-2"
                >
                    <EmojiPicker
                        theme={Theme.DARK}
                        previewConfig={{ showPreview: false, }}
                        className="w-full max-w-md bg-primary"
                        lazyLoadEmojis
                        // onEmojiClick={handleReactionClick}
                        reactionsDefaultOpen />
                </Modal> */}
            </span>
        )
    }

    return <UserBasedButton
        className="flex p-2 border border-gray-500 border-opacity-30 rounded-md"
        Button={Button}
        mutationFn={mutationFn}
        queryFn={(uid) => queryFunction(getReactionOnPost, [id, uid])}
        queryKeys={[`reaction`, id]}
    />
}
export default ReactionButton;