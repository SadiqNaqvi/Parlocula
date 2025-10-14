"use client";

import { InfiniteScroller, Navbar } from "@components";
import RoomBar from "@components/ui/RoomBar";
import { getInvitedRooms } from "@lib/helpers/common";
import { getQueryKeys } from "@lib/utils";

const NotFoundSection = () => (
    <section className="h-stretch flex flex-cntr-all flex-col pt-8">
        <h2>No Invitations yet</h2>
    </section>
)

const InvitationRoomsList = ({ uid, changeRoom }: { uid: string, changeRoom: () => void }) => {

    return (
        <section>
            <Navbar className="h-16 flex items-center px-2" onGoBack={changeRoom} navTitle="Invitations" />
            <InfiniteScroller
                Component={RoomBar}
                fetchData={(p) => getInvitedRooms(uid, p)}
                queryKeys={getQueryKeys("roomInvitations_uid", { uid })}
                NotFoundSection={<NotFoundSection />}
            />
        </section>
    )

}

export default InvitationRoomsList;