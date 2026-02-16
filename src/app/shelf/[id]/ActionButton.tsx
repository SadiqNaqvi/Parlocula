"use client";

import { EditIcon } from "@assets/Icons";
import { Navigate, SaveButton } from "@components";
import { getShelfConnection } from "@lib/helpers/common";
import { acceptCollaboratorInvitation, rejectCollaboratorInvitation } from "@lib/helpers/mutations";
import { useQueryHook } from "@lib/hooks";
import { getQueryKeys } from "@lib/utils";
import { twMerge } from "tailwind-merge";
import AddItemsButton from "./AddItemsButton";

type Props = {
    id: string;
    isPrivate: boolean,
    author: string,
    cuid: string | undefined,
    saved_count: number | undefined,
}

const SaveShelfButton = ({ isPrivate, saved_count, sid, uid, author }: { isPrivate: boolean, uid: string | undefined, author: string, sid: string, saved_count: number | undefined }) => {
    if (!isPrivate) return (
        <SaveButton
            author={author}
            uid={uid}
            count={saved_count}
            type="Shelf"
            id={sid}
            className="primary gap-2"
        />
    )
}

const CheckShelfConnection = ({ uid, sid }: { uid: string, sid: string }) => {

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
        <AddItemsButton sid={sid} uid={uid} />
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

const ActionButton = ({ isPrivate, cuid, author, id, saved_count }: Props) => {

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
            <AddItemsButton uid={cuid} sid={id} className="col-span-2 sm:col-span-1" />

        </section>
    )

    else if (cuid) return (
        <section className={sectionClassName}>
            <SaveShelfButton author={author} isPrivate={isPrivate} saved_count={saved_count} sid={id} uid={cuid} />
            <CheckShelfConnection sid={id} uid={cuid} />
        </section>
    )

    return <SaveShelfButton author={author} isPrivate={isPrivate} saved_count={saved_count} sid={id} uid={cuid} />
}

export default ActionButton;