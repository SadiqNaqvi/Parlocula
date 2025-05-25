import { Navigate, OptionMenu, UserBasedButton } from "@components";
import OptionList from "@components/ui/OptionList";
import { LoadingButton } from "@components/UserBasedButton";
import { block, follow, modifyNotification, removeFollower, unblock, unfollow } from "@lib/helpers/client";
import { checkUserConnection } from "@lib/helpers/common";
import { queryFunction } from "@lib/utils";
import useCurrentUser from "@store/user";
import { MutationFnProps, UserBasedButtonProps } from "@type/other";

type ConnectionType = {
    follows: boolean,
    followBack: boolean,
    isBlocked: boolean,
    haveBlocked: boolean,
    notification: boolean,
}

type Prop = UserBasedButtonProps<ConnectionType>

const Button = ({ isPending, onClick, state }: Prop) => {

    // 
    if (!state || state.isBlocked)
        return <button className="primary" onClick={() => onClick(state!, "doNothing")}>Follow</button>

    const handleClick = (obj: Partial<ConnectionType>, action: string) => {
        if (isPending) return;
        onClick({ ...state, ...obj }, action)
    }

    const { followBack, follows, haveBlocked, notification } = state;

    if (haveBlocked) return <button className="secondary" onClick={() => handleClick({ haveBlocked: false, follows: false }, "unblock")}>Unblock</button>

    else if (!follows) return <button className="primary" onClick={() => handleClick({ haveBlocked: false, follows: false }, "follow")}>{followBack ? "Follow back" : "Follow"}</button>

    else return (
        <OptionMenu
            id="connection-options"
            ButtonElement={"Unfollow"}
            className="secondary"
        >
            <OptionList onClick={() => handleClick({ haveBlocked: false, follows: false }, "unfollow")}>Unfollow</OptionList>
            <OptionList onClick={() => handleClick({ haveBlocked: true }, "block")}>Block</OptionList>
            <OptionList onClick={() => handleClick({ followBack: false }, "remove")}>Remove Follower</OptionList>
            <OptionList onClick={() => handleClick({ notification: !notification }, "notification")}>{notification ? "Disable" : "Enable"} Notification</OptionList>
        </OptionMenu>
    )
}

const ActionButton = ({ rid }: { rid: string }) => {

    const { user, isHydrated } = useCurrentUser();

    if (!isHydrated) return <LoadingButton />

    if (user?._id === rid)
        return <Navigate className="primary btn w-full sm:w-fit" role="button" goto="/me/edit" comp="link" >Edit Profile</Navigate>

    const mutationFn = async ({ action, user_id, newState }: MutationFnProps) => {
        switch (action) {
            case "follow": return await follow(user_id, rid)
            case "unfollow": return await unfollow(user_id, rid)
            case "block": return await block(user_id, rid)
            case "unblock": return await unblock(user_id, rid)
            case "notificaion": return await modifyNotification(user_id, rid, { notification: newState.notificaion })
            case "remove": return await removeFollower(user_id, rid);
        }
    }

    return <UserBasedButton
        Button={Button}
        queryFn={(uid) => queryFunction(checkUserConnection, [uid, rid])}
        mutationFn={mutationFn}
        queryKeys={["connection", rid]}
    />

}

export default ActionButton;