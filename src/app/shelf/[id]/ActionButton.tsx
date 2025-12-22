"use client";

import { EditIcon } from "@assets/Icons";
import { Navigate, SaveButton } from "@components";
import { getShelfConnection } from "@lib/helpers/common";
import { acceptCollaboratorInvitation, rejectCollaboratorInvitation } from "@lib/helpers/mutations";
import { useQueryHook } from "@lib/hooks";
import { getQueryKeys } from "@lib/utils";
import { PropsWithChildren } from "react";

type Props = {
    id: string;
    isPrivate: boolean,
    author: string,
    cuid: string | undefined,
    saved_count: number | undefined,
}

const AddItemButton = ({ sid }: { sid: string }) => (
    <Navigate
        comp="link" goto={`shelf/${sid}/add`}
        type="button" className="primary flex-1"
    >
        Add Items
    </Navigate>
)

const SaveShelfButton = ({ isPrivate, saved_count, sid, uid, author }: { isPrivate: boolean, uid: string | undefined, author: string, sid: string, saved_count: number | undefined }) => {
    if (!isPrivate && uid) return (
        <SaveButton author={author} uid={uid} count={saved_count} type="Shelf" id={sid} />
    )
}

const CheckShelfConnection = ({ uid, sid, children }: PropsWithChildren<{ uid: string, sid: string }>) => {

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
        <div className="flex gap-2">
            <AddItemButton sid={sid} />
            {children}
        </div>
    )

    else if (data?.type === "invitee") return (
        <div className="space-y-2">
            {children}
            <div className="flex gap-2">
                <button className="primary" onClick={acceptInvitation}>Accept</button>
                <button className="secondary" onClick={rejectInvitation}>Reject</button>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 text-center">You{"'"}re invited to become a collaborator of this shelf</p>
        </div>
    )

}

const ActionButton = ({ isPrivate, cuid, author, id, saved_count }: Props) => {

    if (cuid === author) return (
        <section className="flex gap-2">
            <AddItemButton sid={id} />
            <Navigate
                className="secondary flex-1"
                comp="link"
                goto={`/shelf/${id}/collaborators`}
                type="button"
            >
                Manage
            </Navigate>
            <Navigate className="secondary" type="button" comp="link" goto={`/shelf/${id}/edit`}>
                <EditIcon className="size-5" />
            </Navigate>

        </section>
    )

    else if (cuid) return (
        <section className="flex gap-2">
            <CheckShelfConnection sid={id} uid={cuid}>
                <SaveShelfButton author={author} isPrivate={isPrivate} saved_count={saved_count} sid={id} uid={cuid} />
            </CheckShelfConnection>
        </section>
    )

    return <SaveShelfButton author={author} isPrivate={isPrivate} saved_count={saved_count} sid={id} uid={cuid} />
}

export default ActionButton;