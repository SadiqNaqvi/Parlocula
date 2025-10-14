"use client";

import { Navigate } from "@components";
import Modal from "@components/FancyboxModal";
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
    collaborators: string[],
}

const ActionButton = ({ isPrivate, cuid, author, id, filter, saved_count, collaborators }: Props) => {

    const isCreator = Boolean(cuid === author);
    const isMod = Boolean(isCreator || collaborators.find(u => u === cuid));

    if (cuid && isMod) return (
        <section className="flex flex-col sm:flex-row">
            <div className="flex gap-2">
                <Modal buttonChildren="Add Items" className="primary" id="searchPopover">
                    <Search uid={cuid} list_id={id} queryKeys={getQueryKeys("itemsOfList_lid_filter", { lid: id, filter })} />
                </Modal>
                <Navigate className="secondary btn" comp="link" goto={`/l/${id}/edit`} role="button">Edit List</Navigate>
            </div>
            {isCreator && (
                <div>
                    <Navigate className="secondary btn" comp="link" goto={`/l/${id}/collaborators`} role="button">Manage</Navigate>
                </div>
            )}
        </section>
    )

    else if (!isPrivate) return (
        <SaveButton uid={cuid} count={saved_count} type="List" id={id} />
    )

    return null;
}

export default ActionButton;