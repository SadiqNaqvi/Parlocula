"use client";
import { InfiniteScroller, Navbar } from "@components";
import RoomBar from "@components/ui/RoomBar";
import { getInvitedRooms } from "@lib/helpers/common";
import { getQueryKeys, queryFunction } from "@lib/utils";

const NotFoundSection = () => (
    <section>
        <h4>No invitations yet</h4>
    </section>
);

const RoomInvitationList = ({ uid }: { uid: string }) => {

    return (
        <main>
            <Navbar navTitle="Invitations" />
            <header>
                <p className="text-sm text-zinc-500">
                    Below are the rooms where you are invited. Tap to see invitation message, they would not know you have opened the room until you accept the invitation.
                </p>
            </header>
            <section>
                <InfiniteScroller
                    Component={RoomBar}
                    fetchData={(p) => queryFunction(getInvitedRooms, [uid, p])}
                    queryKeys={getQueryKeys("roomInvitations_uid", { uid })}
                    NotFoundSection={<NotFoundSection />}
                />
            </section>
        </main>
    )
}

export default RoomInvitationList;