"use client";

import { BellIcon, BellSlashIcon } from "@assets/Icons";
import { Navigate, OptionMenu } from "@components";
import { closeFancyBox } from "@components/Modal";
import OptionList from "@components/ui/OptionList";
import UserBasedButton from "@components/UserBasedButton";
import { changeThreadNotification, joinThread, leaveThread } from "@lib/helpers/client";
import { isMember } from "@lib/helpers/common";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { MutationFnProps, UserBasedButtonProps } from "@type/other";

type Prop = { notification: boolean } | null;

const JoinButton = ({ tid }: { tid: string }) => {

    const mutationFn = async ({ action, user_id, newState }: MutationFnProps<Prop>) => {
        closeFancyBox(true);
        if (action === "join") await joinThread(tid, user_id);
        else if (action === "notification") await changeThreadNotification(tid, user_id, newState?.notification ?? true);
        else await leaveThread(tid, user_id);
    }

    const Button = ({ onClick, state }: UserBasedButtonProps<Prop>) => {

        const handleClick = (obj: Prop, action: string) => {
            onClick(obj, action);
            closeFancyBox(true);
        }

        if (!state) return <button className="primary" onClick={() => handleClick({ notification: true }, "join")}>Join</button>
        return (
            <div className="space-x-4">
                <OptionMenu
                    id="connection-options"
                    ButtonElement={<>Joined {state.notification ? <BellIcon /> : <BellSlashIcon />}</>}
                    className="secondary"
                >
                    <OptionList onClick={() => handleClick(null, "unfollow")}>Leave Thread</OptionList>
                    <OptionList onClick={() => handleClick({ notification: !state.notification }, "notification")}>{state.notification ? "Disable" : "Enable"} Notification</OptionList>
                </OptionMenu>
                <Navigate comp="link" goto={`/new?tid=${tid}`}>Create Post</Navigate>
            </div>
        )
    }

    return <UserBasedButton
        Button={Button}
        queryFn={(uid: string) => queryFunction(isMember, [tid, uid])}
        queryKeys={getQueryKeys("membership_tid", { tid })}
        mutationFn={mutationFn}
        className="p-2 border border-gray-500 rounded-md"
    />
}

export default JoinButton;