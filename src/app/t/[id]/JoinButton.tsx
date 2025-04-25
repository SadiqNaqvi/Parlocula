"use client";

import UserBasedButton from "@components/UserBasedButton";
import { isMember, joinThread, leaveThread } from "@lib/helpers/client";
import { MutationFnProps, UserBasedButtonProps } from "@type/other";

const JoinButton = ({ tid, tname, tposter }: { tid: string, tname: string, tposter: string }) => {

    const fetchData = async (uid: string) => {
        if (!uid) return false;
        const { errCode, result, success } = await isMember(tid, uid);
        if (!success) throw new Error(errCode);
        return result;
    }

    const mutationFn = async ({ action, user_id }: MutationFnProps) => {
        switch (action) {
            case "join": await joinThread(tid, user_id)
            case "leave": await leaveThread(tid, user_id)
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
        queryFn={fetchData}
        queryKeys={[`member`, tid]}
        mutationFn={mutationFn}
        className="p-2 border border-gray-500 rounded-md"
    />
}

export default JoinButton;