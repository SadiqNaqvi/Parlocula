"use client";

import { Navbar } from "@components";
import ListSelector, { ListSelectorRef, RefinedValues } from "@components/ListSelector";
import { shelfCollaboratorsLimit } from "@lib/constants";
import { searchFollowers } from "@lib/helpers/common";
import { inviteCollaboratorsMutation, removeCollaboratorsMutation } from "@lib/helpers/mutations";
import appToast from "@lib/providers/toast";
import { getQueryKeys } from "@lib/utils";
import { UserMetaData } from "@store/user";
import { MereUser } from "@type/internal";
import { TypedFunction } from "@type/other";
import { useRef } from "react";

type Props = { sid: string, uid: string, total: UserMetaData[], back: TypedFunction }

const refiner = (user: MereUser | UserMetaData): RefinedValues => {

    if ("_id" in user) return {
        title: user.username,
        id: user._id,
        poster: user.profile,
        returnVal: user
    }
    else return {
        title: user.username,
        id: user.user_id,
        poster: user.profile,
    }
}

export const RemoveCollaborators = ({ back, total, sid, uid }: Props) => {

    const callbackRef = useRef<ListSelectorRef>(null);

    const handleRemoval = () => {
        const users = callbackRef.current?.();
        if (!users || !users.length) return;
        removeCollaboratorsMutation(sid, uid, { users });
        back();
    }

    const refinedData = total.map(refiner);

    return (
        <div>
            <Navbar
                navTitle="Remove Collaborators"
                onGoBack={back}
                OptionButton={
                    <button className="primary" onClick={handleRemoval}>Remove</button>
                }
            />

            <section className="space-y-4">
                <ListSelector
                    data={refinedData}
                    callbackRef={callbackRef}
                    returnIds
                    queryFn={undefined}
                    queryKeys={undefined}
                    refiner={undefined}
                />
            </section>
        </div>
    )
}

export const InviteCollaborators = ({ uid, back, total, sid }: Props) => {

    const inviteesRef = useRef<ListSelectorRef<UserMetaData>>(null);

    const handleSubmit = async () => {
        const invitees = inviteesRef.current?.();
        if (!invitees || !invitees.length)
            return appToast.error("At least one user should be selected to invite")

        inviteCollaboratorsMutation(sid, invitees.map(u => ({ ...u, type: "invitee" })));
        back();
    }

    return (
        <div className="space-y-4">
            <Navbar
                navTitle="Invite Collaborators"
                onGoBack={back}
                OptionButton={
                    <button className="primary" onClick={handleSubmit}>Invite</button>
                }
            />

            <section className="px-4">
                <ListSelector
                    queryFn={(q, p) => searchFollowers(q, uid, p)}
                    queryKeys={q => getQueryKeys("search-followers_uid_query", { uid, query: q })}
                    callbackRef={inviteesRef}
                    inputPlaceholder="Search your followers"
                    refiner={refiner}
                    limit={shelfCollaboratorsLimit - total.length}
                />
            </section>
        </div>
    )
}