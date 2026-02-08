"use client";

import { ReactIcon } from "@assets/Icons";
import { BottomSheet, BottomSheetRef, UserBasedButton, UserBasedButtonProps } from "@components";
import { getReactionOnPost } from "@lib/helpers/common";
import { getQueryKeys, numberConverter } from "@lib/utils";
import EmojiPicker, { Emoji, EmojiClickData, Theme } from "emoji-picker-react";
import { useRef } from "react";

const className = "flex gap-2 items-center text-sm";

const NoUserStateButton = ({ count }: { count: number }) => (
    <>
        <ReactIcon />
        <span>{numberConverter(count)}</span>
    </>
)

const ReactionButton = ({ id, count, uid }: { id: string, count: number, uid: string | undefined }) => {

    const sheetRef = useRef<BottomSheetRef>();

    const Button = ({ onClick, state, user_id }: UserBasedButtonProps<string>) => {

        const handleReactionClick = (el: EmojiClickData) => {
            const { unified } = el;
            if (state === unified) onClick(null, "remove_reaction", [id, user_id]);
            else onClick(unified, "create_reaction", [user_id, id, unified]);
            sheetRef.current?.close();
        }

        return (
            <>
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
                    className={className}
                >
                    <EmojiPicker
                        theme={Theme.DARK}
                        previewConfig={{ showPreview: false, }}
                        className="w-full max-w-md bg-primary"
                        lazyLoadEmojis
                        onEmojiClick={handleReactionClick}
                        reactionsDefaultOpen />
                </BottomSheet>
            </>
        )
    }

    return (
        <UserBasedButton
            uid={uid}
            noUserStateChilren={<NoUserStateButton count={count} />}
            noUserStateClassName={className}
            redirectAfterLogin={`/post/${id}`}
            errorStateClassName="flex p-2 border border-gray-500 border-opacity-30 rounded-md"
            Button={Button}
            queryFn={(userid) => getReactionOnPost(id, userid)}
            queryKeys={getQueryKeys("reaction_pid", { pid: id })}
        />
    )
}

export default ReactionButton;