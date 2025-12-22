import { CheckIcon } from "@assets/Icons";
import { InfiniteScroller, ListSelector, ListSelectorRef, Navbar } from "@components";
import { UserBar } from "@components/ui";
import { getParticipantsOfRoom, searchFollowers } from "@lib/helpers/common";
import { inviteParticipants, removeParticipants } from "@lib/helpers/mutations";
import { getQueryKeys } from "@lib/utils";
import { ParticipantEnumType } from "@type/internal";
import { TypedFunction } from "@type/other";
import { useRef, useState } from "react";

type Sections = "list" | "removing" | "inviting";
type Props = { rmid: string, uid: string }

const InviteSection = ({ rmid, uid }: Props & { back: TypedFunction }) => {

    const callbackRef = useRef<ListSelectorRef>(null);
    const handleInvitation = () => {
        const participants = callbackRef.current?.();
        if (!participants || !participants.length) return;
        inviteParticipants(rmid, uid, participants);
    }

    return (
        <>
            <Navbar
                navTitle="Invite Participants"
                OptionButton={
                    <button onClick={handleInvitation}>
                        <CheckIcon />
                    </button>
                }
            />
            <ListSelector
                callbackRef={callbackRef}
                queryKeys={(query) => getQueryKeys("search-followers_uid_query", { uid, query })}
                queryFn={(q, p) => searchFollowers(q, uid, p)}
                refiner={(user) => ({
                    id: user._id,
                    title: user.username,
                    poster: user.profile,
                })}
            />
        </>
    )

}

const RemoveSection = ({ rmid, uid }: Props & { back: TypedFunction }) => {

    const callbackRef = useRef<ListSelectorRef>(null);

    const handleRemoval = () => {
        const participants = callbackRef.current?.();
        if (!participants || !participants.length) return;
        removeParticipants(rmid, uid, participants);
    }

    return (
        <>
            <Navbar
                navTitle="Invite Participants"
                OptionButton={
                    <button onClick={handleRemoval}>
                        <CheckIcon />
                    </button>
                }
            />
            <ListSelector
                callbackRef={callbackRef}
                queryKeys={undefined}
                queryFn={undefined}
                queryFnForList={(p) => getParticipantsOfRoom(uid, rmid, p)}
                queryKeysForList={getQueryKeys("participantsOfRoom_rmid_uid", { rmid, uid })}
                refiner={(user) => ({
                    id: user._id,
                    title: user.username,
                    poster: user.profile,
                })}
            />
        </>
    )

}

const ParticipantsPage = ({ rmid, uid, participantType }: Props & { participantType: ParticipantEnumType }) => {

    const [section, setSection] = useState<Sections>("list");

    const handleBack = () => setSection("list");

    if (section === "inviting") return (
        <InviteSection back={handleBack} rmid={rmid} uid={uid} />
    )

    else if (section === "removing" && participantType === "creator") return (
        <RemoveSection back={handleBack} rmid={rmid} uid={uid} />
    )

    return (
        <>
            <Navbar navTitle="Participants" />
            <InfiniteScroller
                Component={UserBar}
                fetchData={(p) => getParticipantsOfRoom(uid, rmid, p)}
                queryKeys={getQueryKeys("participantsOfRoom_rmid_uid", { rmid, uid })}
            />
        </>
    )
}

export default ParticipantsPage;