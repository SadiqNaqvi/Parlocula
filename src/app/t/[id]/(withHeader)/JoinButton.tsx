"use client";

import UserBasedButton from "@components/UserBasedButton";
import { joinThread, leaveThread } from "@lib/helpers/client";
import { isMember } from "@lib/helpers/common";
import { queryFunction } from "@lib/utils";
import { MutationFnProps, UserBasedButtonProps } from "@type/other";

const JoinButton = ({ tid }: { tid: string }) => {

    const mutationFn = async ({ action, user_id }: MutationFnProps) => {
        switch (action) {
            case "join": return await joinThread(tid, user_id);
            case "leave": return await leaveThread(tid, user_id);
        }
    }

    const Button = ({ isPending, onClick, state }: UserBasedButtonProps<boolean>) => (
        <button
            className={state ? "secondary" : "primary"}
            disabled={isPending}
            onClick={() => onClick(!state, state ? "join" : "leave")}>
            {state ? "Joined" : "Join"}
        </button>
    )

    return <UserBasedButton
        Button={Button}
        queryFn={(uid: string) => queryFunction(isMember, [tid, uid])}
        queryKeys={[`member`, tid]}
        mutationFn={mutationFn}
        className="p-2 border border-gray-500 rounded-md"
    />
}

export default JoinButton;