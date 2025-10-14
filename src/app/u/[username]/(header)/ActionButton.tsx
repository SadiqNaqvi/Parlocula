import { BellIcon, BellSlashIcon } from "@assets/Icons";
import { Navigate, OptionMenu, UserBasedButton } from "@components";
import { closeFancyBox } from "@components/FancyboxModal";
import OptionList from "@components/ui/OptionList";
import { block, follow, modifyNotification, removeFollower, unblock, unfollow } from "@lib/helpers/client";
import { checkUserConnection } from "@lib/helpers/common";
import { getQueryKeys, ObjectId, queryFunction } from "@lib/utils";
import { UserConnectionType } from "@type/internal";
import { MutationFnProps, UserBasedButtonProps } from "@type/other";

type ButtonProps = UserBasedButtonProps<UserConnectionType>
type Props = {
    rid: string,
    uid: string | undefined,
}

const ActionButton = ({ rid, uid }: Props) => {
    const Button = ({ isPending, onClick, state }: ButtonProps) => {

        if (!state || state.isBlocked)
            return <button className="flex-1 sm:w-fit primary" onClick={() => onClick(state!, "doNothing")}>Follow</button>

        const handleClick = (obj: Partial<UserConnectionType>, action: string) => {
            if (isPending) return;
            onClick({ ...state, ...obj }, action);
            closeFancyBox(true);
        }

        const { followBack, follows, haveBlocked, notification } = state;

        if (haveBlocked) return <button className="flex-1 sm:w-fit secondary" onClick={() => handleClick({ haveBlocked: false, follows: false }, "unblock")}>Unblock</button>

        else if (!follows) return (
            <button className="flex-1 sm:w-fit primary" onClick={() => handleClick({ haveBlocked: false, follows: true }, "follow")}>{followBack ? "Follow back" : "Follow"}</button>
        )

        else return (
            <>
                <OptionMenu
                    id="connection-options"
                    ButtonElement={<>Unfollow {notification ? <BellIcon /> : <BellSlashIcon />}</>}
                    className="flex-1 sm:w-fit secondary"
                >
                    <OptionList onClick={() => handleClick({ haveBlocked: false, follows: false }, "unfollow")}>Unfollow</OptionList>
                    <OptionList onClick={() => handleClick({ haveBlocked: true }, "block")}>Block</OptionList>
                    <OptionList onClick={() => handleClick({ followBack: false }, "remove")}>Remove Follower</OptionList>
                    <OptionList onClick={() => handleClick({ notification: !notification }, "notification")}>{notification ? "Disable" : "Enable"} Notification</OptionList>
                </OptionMenu>
            </>
        )
    }

    if (rid === uid)
        return <Navigate className="primary btn w-full sm:w-fit" role="button" goto="/me/edit" comp="link" >Edit Profile</Navigate>

    const mutationFn = async ({ action, user_id, newState }: MutationFnProps) => {
        if (action === "follow") await follow(user_id, rid)
        else if (action === "unfollow") await unfollow(user_id, rid)
        else if (action === "block") await block(user_id, rid)
        else if (action === "unblock") await unblock(user_id, rid)
        else if (action === "notificaion") await modifyNotification(user_id, rid, { notification: newState.notificaion })
        else if (action === "remove") await removeFollower(user_id, rid);
    }

    return <UserBasedButton
        Button={Button}
        uid={uid}
        queryFn={(uid) => queryFunction(checkUserConnection, [uid, rid])}
        mutationFn={mutationFn}
        queryKeys={getQueryKeys("connection_ruid", { ruid: rid })}
    />

}

export default ActionButton;