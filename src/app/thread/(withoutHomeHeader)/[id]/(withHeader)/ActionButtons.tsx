"use client";

import { BellIcon, BellSlashIcon } from "@assets/Icons";
import { Navigate, OptionMenu, UserBasedButton, UserBasedButtonProps } from "@components";
import OptionList from "@components/ui/OptionList";
import { isMember } from "@lib/helpers/common";
import { acceptManagerInvitation, rejectManagerInvitation } from "@lib/helpers/mutations";
import { AvailableMutations } from "@lib/providers/mutationStore";
import { getQueryKeys } from "@lib/utils";
import useGlobalStore from "@store/globalStore";
import { useNavigation } from "@store/historystack";
import { MereThread, ThreadMembership } from "@type/internal";
import { toast } from "sonner";

const RoleBasedActionButtons = ({ role, tid }: { tid: string, role: ThreadMembership["role"] }) => {

    if (role === "member") return;

    const acceptInvite = () => {
        acceptManagerInvitation(tid);
    }

    const rejectInvite = () => {
        rejectManagerInvitation(tid);
    }

    if (role === "moderator_invitee") return (
        <div>
            <div className="flex gap-2">
                <button onClick={acceptInvite} className="primary flex-1 sm:flex-0">Accept</button>
                <button onClick={rejectInvite} className="secondary flex-1 sm:flex-0">Deny</button>
            </div>
            <p className="text-sm text-zinc-500">You are invited to become a Manager of this thread.</p>
        </div>
    )

    return (
        <Navigate comp="link" type="button" goto={`/thread/${tid}/settings`} className="w-full sm:w-fit secondary">
            Settings
        </Navigate>
    )

}

const JoinButton = ({ thread, uid }: { thread: MereThread, uid?: string }) => {

    const navigation = useNavigation();
    const [, setThreadToPost] = useGlobalStore("chosenThreadToPost");

    const handleNewPostRedirect = () => {
        setThreadToPost(thread);
        navigation.goto("/new");
    }

    const Button = ({ onClick, state, user_id }: UserBasedButtonProps<ThreadMembership>) => {

        const handleClick = (action: AvailableMutations) => {
            if (action === "join_thread")
                onClick({ notification: true }, action, [thread._id, user_id]);
            else if (action === "leave_thread")
                onClick(null, action, [thread._id, user_id]);
            else onClick(null, "update_thread_notification", [thread._id, user_id, !state?.notification]);
        }

        if (state?.banned) return (
            <button
                className="primary w-full sm:w-fit"
                onClick={() => toast.error("Something went wrong!")}>
                Join
            </button>
        )

        else if (!state) return (
            <button
                className="primary w-full sm:w-fit"
                onClick={() => handleClick("join_thread")}>
                Join
            </button>
        )

        return (
            <>
                <div className="flex gap-2">
                    <OptionMenu
                        id="connection-options"
                        ButtonElement={<>Joined {state.notification ? <BellIcon /> : <BellSlashIcon />}</>}
                        className="secondary flex-1 sm:flex-0"
                    >
                        <OptionList onClick={() => handleClick("leave_thread")}>Leave Thread</OptionList>
                        <OptionList onClick={() => handleClick("update_thread_notification")}>{state.notification ? "Disable" : "Enable"} Notification</OptionList>
                    </OptionMenu>
                    <button className="secondary flex-1 sm:flex-0" onClick={handleNewPostRedirect}>Create Post</button>
                </div>
                <RoleBasedActionButtons role={state.role} tid={thread._id} />
            </>
        )
    }

    return <UserBasedButton
        Button={Button}
        uid={uid}
        queryFn={(user_id) => isMember(thread._id, user_id)}
        queryKeys={getQueryKeys("membership_tid", { tid: thread._id })}
        className="p-2 border border-gray-500 rounded-md"
    />
}

export default JoinButton;