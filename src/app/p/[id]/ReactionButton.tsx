"use client";

import { UserBasedButton } from "@components";
import { addReactionOnPost, getReactionOnPost, removeReactionOnPost } from "@lib/helpers/client";
import { convertCodeIntoError, numberConverter } from "@lib/utils";
import EmojiPicker, { Theme } from "emoji-picker-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MutationFnProps, UserBasedButtonProps } from "@type/other";

const ReactionButton = ({ id, count }: { id: string, count: number }) => {

    const searchParams = useSearchParams();
    const action = searchParams.get('action');
    const pathname = usePathname();
    const router = useRouter();

    const queryFn = async (uid: string) => {
        if (!uid) return null;
        const { errCode, result, success } = await getReactionOnPost(id, uid);
        if (!success) throw new Error(convertCodeIntoError(errCode) as string)
        return result ? result : null
    }

    const mutationFn = async ({ newState, action, user_id }: MutationFnProps<string>) => {
        if (action === "react") await addReactionOnPost(user_id, id, newState);
        else await removeReactionOnPost(id, user_id);
    }

    const handleReactionState = (newState?: boolean) => {
        const params = new URLSearchParams(searchParams);
        newState ? params.set("action", "react") : params.delete("action");
        router.push(`${pathname}?${params.toString()}`)
    }

    const Button = ({ onClick, state }: UserBasedButtonProps<string>) => (
        <span className="flex p-2 border border-gray30 rounded-md">
            {action === "react" &&
                <section className="fixed inset-0 z-[11] flex justify-center backdrop-brightness-75" onClick={() => handleReactionState()}>
                    <div onClick={e => e.stopPropagation()}>
                        <EmojiPicker
                            theme={Theme.DARK}
                            previewConfig={{ showPreview: false }}
                            className="mt-auto mb-12 md:my-auto w-full max-w-md bg-primary"
                            lazyLoadEmojis
                            reactionsDefaultOpen />
                    </div>
                </section>
            }
            <button className="smallBtn flex gap-2" onClick={() => handleReactionState(true)}>
                <span>{state ? state : "React"}</span>
                <span>
                    {state ? numberConverter(count) + 1 : numberConverter(count)}
                </span>
            </button>
        </span>
    )

    return <UserBasedButton
        className="flex p-2 border border-gray-500 border-opacity-30 rounded-md"
        Button={Button}
        mutationFn={mutationFn}
        queryFn={queryFn}
        queryKeys={[`reaction`, id]}
    />
}
export default ReactionButton;