"use client";

import { Ellipsis } from "@assets/Icons";
import { OptionMenu } from "@components";
import { WarningModal } from "@components/Modal";
import ReportSheet from "@components/ReportSheet";
import { NestedSheetTrigger } from "@components/ui/OptionList";
import { blockUser, deleteComment } from "@lib/helpers/client";
import useCurrentUser from "@store/user";
import { FullComment } from "@type/internal";
import EditComment from "./EditComment";

const OptionsButton = ({ author, id, comment }: { author: string, id: string, comment: FullComment }) => {

    const { meta } = useCurrentUser();

    if (!meta) return null;


    const handleDelete = () => {
        deleteComment(id, meta.user_id);
    }

    const handleBlock = () => {
        blockUser(meta.user_id, author);
    }


    if (meta.user_id === author) return (
        <OptionMenu ButtonElement={<Ellipsis />}>
            <NestedSheetTrigger button="Edit">
                <EditComment comment={comment} />
            </NestedSheetTrigger>
            <NestedSheetTrigger button="Delete">
                <WarningModal
                    action="delete this comment"
                    dangerButton="Delete"
                    dangerFunc={handleDelete}
                />
            </NestedSheetTrigger>
        </OptionMenu>
    )

    return (
        <OptionMenu ButtonElement={<Ellipsis />}>
            <NestedSheetTrigger button="Report">
                <ReportSheet id={id} type="comment" />
            </NestedSheetTrigger>
            <NestedSheetTrigger button="Block User">
                <WarningModal
                    action="block the author this comment"
                    dangerButton="Block"
                    dangerFunc={handleBlock}
                />
            </NestedSheetTrigger>
        </OptionMenu>
    )

}

export default OptionsButton;