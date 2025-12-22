import { Ellipsis } from "@assets/Icons";
import { OptionMenu, WarningModal } from "@components";
import OptionList, { NestedSheetTrigger } from "@components/ui/OptionList";
import { blockUserMutation, deleteShelfMutation, updateShelfKeyMutation } from "@lib/helpers/mutations";
import appToast from "@lib/providers/toast";
import { useNavigation } from "@store/historystack";
import useCurrentUser from "@store/user";
import { toast } from "sonner";

const EllipsisButton = ({ author, id, isPrivate }: { author: string, id: string, isPrivate: boolean }) => {

    const { meta } = useCurrentUser();
    const navigation = useNavigation();

    if (!meta) return null;

    const handleDelete = () => {
        deleteShelfMutation(id, meta.user_id);
        navigation.back();
    }

    const handleBlock = () => {
        blockUserMutation(meta.user_id, author);
        navigation.back();
    }

    const handlePasskeyUpdate = () => {
        toast.promise(updateShelfKeyMutation(id, meta.user_id), {
            success: (result) => {
                if (!result) return "Successfully Updated";
            }
        })
    }


    if (meta.user_id === author) return (
        <OptionMenu ButtonElement={<Ellipsis />}>

            <OptionList link={`${id}/edit`}>Edit</OptionList>

            <NestedSheetTrigger button="Delete">
                <WarningModal
                    action="delete this shelf"
                    dangerButton="Delete"
                    dangerFunc={handleDelete}
                />
            </NestedSheetTrigger>

            {isPrivate && (
                <NestedSheetTrigger button="Update your Shelf Key">
                    <WarningModal
                        action="update shelf-key"
                        details="Nobody can view your shelf with the old key anymore."
                        dangerButton="Update"
                        dangerFunc={handlePasskeyUpdate}
                    />
                </NestedSheetTrigger>
            )}

        </OptionMenu>
    )

    return (
        <OptionMenu ButtonElement={<Ellipsis />}>
            <NestedSheetTrigger button="Block User">
                <WarningModal
                    action="block the creator of this shelf"
                    dangerButton="Block"
                    dangerFunc={handleBlock}
                />
            </NestedSheetTrigger>
        </OptionMenu>
    )

}

export default EllipsisButton;