import { UserBasedButton } from "@components";
import { checkIfItemSaved, saveItem, unsaveItem } from "@lib/helpers/client";
import useCurrentUser from "@store/user";
import { MutationFnProps, UserBasedButtonProps } from "@type/other";

type Props = {
    id: string;
    isPrivate: boolean,
    disabled: boolean,
    author: string,
    searchModal: () => void,
    deletionModal: () => void
}


const Savebutton = ({ id, author }: { id: string, author: string }) => {
    const isSaved = async (uid: string) => {
        if (!id) return false;
        const { errCode, result, success } = await checkIfItemSaved(id, uid);
        if (!success) throw new Error(errCode);
        return result;
    }

    const mutationFn = async ({ newState, action, user_id }: MutationFnProps) => {
        if (action === "save")
            await saveItem({ content_id: id, content_type: "List", content_author: author }, user_id)
        else await unsaveItem(id, user_id);
        // if (!done) throw new Error();
    }

    const Button = ({ isPending, onClick, state }: UserBasedButtonProps<boolean>) => (
        <button
            className={state ? "secondary" : "primary"}
            disabled={isPending}
            onClick={() => onClick(!state, state ? "unsave" : "save")}
        >
            Save{state ? "d" : ""}
        </button>
    )

    return <UserBasedButton
        Button={Button}
        queryFn={() => isSaved(id)}
        queryKeys={[`saved`, "list", id]}
        mutationFn={mutationFn}
        className="p-2 border border-gray-500 rounded-md"
    />
}

const ActionButton = ({ isPrivate, disabled, author, deletionModal, searchModal, id }: Props) => {
    const { user } = useCurrentUser();

    return (
        <div className="flex gap-3">
            {user?._id === author ?
                <>
                    <button className="primary" disabled={disabled} onClick={searchModal}>Add Items</button>
                    <button className="secondary" disabled={disabled} onClick={deletionModal}>Remove Items</button>
                </>
                : isPrivate ?
                    <button className="primary">Share</button>
                    :
                    <>
                        <Savebutton author={author} id={id} />
                        <button className="bigbtn border-gray30">Share</button>
                    </>
            }
        </div>

    )
}

export default ActionButton;