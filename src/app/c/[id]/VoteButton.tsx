"use client";

import { ThumbDownIcon, ThumbDownIconFill, ThumbUpIcon, ThumbUpIconFill } from "@assets/Icons";
import UserBasedButton from "@components/UserBasedButton";
import { removeVoteOnComment, voteOnComment } from "@lib/helpers/client";
import { getVoteOnComment } from "@lib/helpers/common";
import { getQueryKeys, numberConverter, queryFunction } from "@lib/utils";
import { MutationFnProps, UserBasedButtonProps } from "@type/other";

const VoteButton = ({ id, voteCount, author }: { id: string, voteCount: number, author: string }) => {

    const mutationFn = async ({ newState, action, user_id }: MutationFnProps) => {
        if (action === "vote")
            await voteOnComment(id, user_id, { comment_author: author, type: newState })
        else await removeVoteOnComment(id, user_id)
    }

    const optimisticCount = (state: string | null, count: number) => {
        const votes = count ?? 0;
        if (state === "up") return numberConverter(votes + 1)
        else if (state === "down") return numberConverter(votes - 1)
        else return numberConverter(votes);
    }

    const Button = ({ onClick, state }: UserBasedButtonProps<"up" | "down" | null>) => (
        <div className="inline-flex p-2 border border-gray20 rounded-lg">
            <button className="pr-2 smallBtn" onClick={() => onClick(state === "up" ? null : "up", state === "up" ? "remove" : "vote")}>
                {state === "up" ? <ThumbUpIconFill /> : <ThumbUpIcon />}
            </button>
            <span className="px-2 border-x border-gray20">{optimisticCount(state, voteCount)}</span>
            <button className="pl-2 smallBtn" onClick={() => onClick(state === "down" ? null : "down", state === "down" ? "remove" : "vote")}>
                {state === "down" ? <ThumbDownIconFill /> : <ThumbDownIcon />}
            </button>
        </div >
    );

    return <UserBasedButton
        Button={Button}
        queryFn={(uid) => queryFunction(getVoteOnComment, [id, uid])}
        queryKeys={getQueryKeys("vote_cid", { cid: id })}
        mutationFn={mutationFn}
        className="inline p-1 border border-gray20 rounded-lg"
        Loading={<span><span className="size-8 animate-spin"></span></span>}
    />
}

export default VoteButton;