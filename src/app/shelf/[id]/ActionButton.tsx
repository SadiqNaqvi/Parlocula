"use client";

import { EditIcon } from "@assets/Icons";
import { Navigate, SaveButton } from "@components";
import { getShelfConnection } from "@lib/helpers/common";
import { acceptCollaboratorInvitation, rejectCollaboratorInvitation } from "@lib/helpers/mutations";
import { useQueryHook } from "@lib/hooks";
import { getQueryKeys } from "@lib/utils";
import { AllShelves } from "@type/models";
import AddItemsButton from "./AddItemsButton";

type Props = {
    id: string;
    isPrivate: boolean,
    author: string,
    cuid: string | undefined,
    saved_count: number | undefined,
    shelf_type: AllShelves,
}

const SaveShelfButton = ({ isPrivate, saved_count, id, cuid, author }: Omit<Props, "shelf_type">) => {
    if (!isPrivate) return (
        <SaveButton
            author={author}
            uid={cuid}
            count={saved_count}
            type="Shelf"
            id={id}
            className="primary gap-2"
        />
    )
}

const CheckShelfConnection = ({ uid, sid, shelf_type }: { uid: string, sid: string, shelf_type: AllShelves }) => {

    const { data } = useQueryHook({
        queryFn: () => getShelfConnection(uid, sid),
        queryKeys: getQueryKeys("shelfConnection_sid", { sid }),
    });

    const acceptInvitation = () => {
        acceptCollaboratorInvitation(sid);
    }

    const rejectInvitation = () => {
        rejectCollaboratorInvitation(sid);
    }

    if (data?.type === "collaborator") return (
        <AddItemsButton shelf_type={shelf_type} sid={sid} uid={uid} />
    )

    else if (data?.type === "invitee") return (
        <>
            <div className="contents">
                <button className="primary" onClick={acceptInvitation}>Accept</button>
                <button className="secondary" onClick={rejectInvitation}>Reject</button>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 text-center col-span-4">You{"'"}re invited to become a collaborator of this shelf</p>
        </>
    )

}

const sectionClassName = "grid gap-2 grid-cols-2 sm:grid-cols-4";

const ActionButton = ({ isPrivate, cuid, author, id, saved_count, shelf_type }: Props) => {

    if (cuid === author) return (
        <section className={sectionClassName}>
            <Navigate
                className="btn secondary gap-2"
                type="button"
                comp="link"
                goto={`/shelf/${id}/edit`}>
                <EditIcon />
                <span>Edit</span>
            </Navigate>
            <Navigate
                className="btn secondary"
                comp="link"
                goto={`/shelf/${id}/collaborators`}
                type="button"
            >
                Manage
            </Navigate>
            <AddItemsButton shelf_type={shelf_type} uid={cuid} sid={id} className="col-span-2 sm:col-span-1" />

        </section>
    )

    else if (cuid) return (
        <section className={sectionClassName}>
            <SaveShelfButton author={author} isPrivate={isPrivate} saved_count={saved_count} id={id} cuid={cuid} />
            <CheckShelfConnection shelf_type={shelf_type} sid={id} uid={cuid} />
        </section>
    )

    return <SaveShelfButton author={author} isPrivate={isPrivate} saved_count={saved_count} id={id} cuid={cuid} />
}

export default ActionButton;