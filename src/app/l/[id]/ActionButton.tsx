"use client";

import { Navigate } from "@components";
import Modal from "@components/Modal";
import SaveButton from "@components/SaveButton";
import { getQueryKeys } from "@lib/utils";
import Search from "./Search";

type Props = {
    id: string;
    isPrivate: boolean,
    author: string,
    cuid: string | undefined,
    filter: string,
    saved_count: number,
}

const ActionButton = ({ isPrivate, cuid, author, id, filter, saved_count }: Props) => {

    if (cuid === author) return (
        <div className="flex gap-2">
            <Modal buttonChildren="Add Items" className="primary" id="searchPopover">
                <Search uid={cuid} list_id={id} queryKeys={getQueryKeys("itemsOfList_lid_filter_page", { lid: id, filter, page: 1 })} />
            </Modal>
            <Navigate className="secondary btn" comp="link" goto={`/l/${id}/edit`} role="button">Edit List</Navigate>
        </div>
    )

    else if (!isPrivate) return (
        <SaveButton count={saved_count} type="List" id={id} />
    )

    return null;
}

export default ActionButton;