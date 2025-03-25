"use client";

import { ThumbDownIcon, ThumbUpIcon } from "@assets/Icons";
import UserBasedButton from "@components/UserBasedButton";
import { getVoteOnComment } from "@lib/actions/clientActions";
import { numberConverter } from "@lib/utils";

type ButtonProps = {
    state?: "up" | "down",
    isPending: boolean,
    onClick: (state?: string) => void;
}

const queryFn = async (cid: string, uid?: string) => {
    if (!uid) return null;
    const { errCode, result, success } = await getVoteOnComment({ cid, uid });
    if (!success) throw new Error(errCode);
    return result ? result : null;
}

const VoteButton = ({ id, voteCount }: { id: string, voteCount: number }) => {

    const mutationFn = ({ state }: { state?: string }) => {
        console.log(state);
    }

    const optimisticCount = (state: string | undefined, count: number) => {
        const votes = count ?? 0;
        if (state === "up") return numberConverter(votes + 1)
        else if (state === "down") return numberConverter(votes - 1)
        else return numberConverter(votes);
    }

    const Button = ({ onClick, state }: ButtonProps) => (
        <div className="inline-flex p-2 border border-gray20 rounded-lg">
            <button className="pr-2 smallBtn" onClick={() => onClick(state === "up" ? undefined : "up")}>
                <ThumbUpIcon classnames={state === "up" ? "color-secondary" : ""} />
            </button>
            <span className="px-2 border-x border-gray20">{optimisticCount(state, voteCount)}</span>
            <button className="pl-2 smallBtn" onClick={() => onClick(state === "down" ? undefined : "down")}>
                <ThumbDownIcon classnames={state === "down" ? "color-secondary" : ""} />
            </button>
        </div>
    );

    return <UserBasedButton
        Button={Button}
        queryFn={(user) => queryFn(id, user?._id)}
        queryKeys={[`vote`, id]}
        mutationFn={mutationFn}
        className="inline p-1 border border-gray20 rounded-lg"
    />
}

export default VoteButton;