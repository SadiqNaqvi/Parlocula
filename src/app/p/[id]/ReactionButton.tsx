"use client";

import { UserBasedButton } from "@components";
import { addReactionOnPost, getReactionOnPost, removeReactionOnPost } from "@lib/actions/clientActions";
import { convertCodeIntoError, numberConverter } from "@lib/utils";
import { MutationFnProps } from "@type/internal";
import toast from "react-hot-toast";
import EmojiPicker, { Theme } from "emoji-picker-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const queryFn = async (pid: string, uid?: string) => {
    if (!uid) return null;
    const { errCode, result, success } = await getReactionOnPost({ pid, uid })
    if (!success) throw new Error(convertCodeIntoError(errCode) as string)
    return result ? result : null
}

type ButtonProps = {
    state?: string,
    isPending: boolean,
    onClick: (state?: string | null) => void;
}

const ReactionButton = ({ id, count }: { id: string, count: number }) => {

    const searchParams = useSearchParams();
    const action = searchParams.get('action');
    const pathname = usePathname();
    const router = useRouter();

    const mutationFn = async ({ state }: MutationFnProps<string | null>) => {
        console.log(state);
        // if (state) {
        //     const error = await addReactionOnPost(state, id);
        //     if (error) toast.error(error);
        // } else {
        //     const error = await removeReactionOnPost(id);
        //     if (error) toast.error(error);
        // }
    }

    const handleReactionState = (newState?: boolean) => {
        const params = new URLSearchParams(searchParams);
        newState ? params.set("action", "react") : params.delete("action");
        router.push(`${pathname}?${params.toString()}`)
    }

    const Button = ({ onClick, state }: ButtonProps) => (
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
        queryFn={(user) => queryFn(id, user?._id)}
        queryKeys={[`reaction`, id]}
    />
}
export default ReactionButton;