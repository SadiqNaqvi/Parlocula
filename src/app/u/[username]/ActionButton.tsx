import { OptionMenu, UserBasedButton } from "@components";
import OptionList from "@components/ui/OptionList";
import { block, checkUserConnection, follow, modifyNotification, removeFollower, unblock, unfollow } from "@lib/helpers/client";
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

    if (!state || state.isBlocked) return <button className="primary">Follow</button>

    const handleClick = (obj: Partial<ConnectionType>, action: string) => {
        if (isPending) return;
        onClick({ ...state, ...obj }, action)
    }

    const { followBack, follows, haveBlocked, notification } = state;


    if (haveBlocked) return <button className="secondary" onClick={() => handleClick({ haveBlocked: false, follows: false }, "unblock")}>Unblock</button>

    else if (!follows) return <button className="primary" onClick={() => handleClick({ haveBlocked: false, follows: false }, "follow")}>{followBack ? "Follow back" : "Follow"}</button>

    else return <OptionMenu
        ButtonElement={"Unfollow"}
        className="secondary"
    >
        <OptionList onClick={() => handleClick({ haveBlocked: false, follows: false }, "unfollow")}>Unfollow</OptionList>
        <OptionList onClick={() => handleClick({ haveBlocked: true }, "block")}>Block</OptionList>
        <OptionList onClick={() => handleClick({ followBack: false }, "remove")}>Remove Follower</OptionList>
        <OptionList onClick={() => handleClick({ notification: !notification }, "notification")}>{notification ? "Disable" : "Enable"} Notification</OptionList>
    </OptionMenu >

}

const ActionButton = ({ rid }: { rid: string }) => {

    const queryFn = async (uid: string) => {
        const { success, errCode, result } = await checkUserConnection(uid, rid);
        if (!success) throw Error();
        return result;
    }

    const mutationFn = async ({ action, user_id, newState }: MutationFnProps) => {
        switch (action) {
            case "follow": await follow(user_id, rid)
            case "unfollow": await unfollow(user_id, rid)
            case "block": await block(user_id, rid)
            case "unblock": await unblock(user_id, rid)
            case "notificaion": await modifyNotification(user_id, rid, { notification: newState.notificaion })
            case "remove": await removeFollower(user_id, rid);
        }
    }

    return <UserBasedButton
        Button={Button}
        queryFn={queryFn}
        mutationFn={mutationFn}
        queryKeys={["connection", rid]}
    />

}

export default ActionButton;