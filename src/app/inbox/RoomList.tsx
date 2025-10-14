"use client";

import { AddIcon, SearchIcon } from "@assets/Icons";
import { InfiniteScroller } from "@components";
import RoomBar from "@components/ui/RoomBar";
import { getRooms } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys } from "@lib/utils";
import useOfflineStore from "@store/offlineStore";
import { InfiniteQueryResponse } from "@type/internal";
import { InfiniteScrollerDataType } from "@type/other";
import { useParams } from "next/navigation";
import { Suspense, useState } from "react";
import InvitationRoomsList from "./InvitationRoomList";
import RoomSearchList from "./SearchList";
import CreateGroup from "./CreateGroup";

type PageType = "rooms" | "invitations" | "search" | "create";

const NoRoomSection = () => (
    <div className="mt-8">
        <h2 className="text-center text-xl font-semibold">No chats yet?</h2>
        <p className="text-center mt-2">Click on the + icon and start chatting</p>
    </div>
)

const InvitationsCount = ({ uid }: { uid: string }) => {
    const invitationsCount = getQueryClient().getQueryData<InfiniteScrollerDataType>(getQueryKeys("roomInvitations_uid", { uid }))?.pages[0]?.results.length;
    return `Invitations ${invitationsCount || ''}`
}

const RoomsList = ({ uid, changeRoom }: { uid: string, changeRoom: (args: PageType) => void }) => {

    const qkeys = getQueryKeys("rooms_uid", { uid });

    const [roomList, setRoomList] = useOfflineStore<InfiniteQueryResponse<any> | undefined>(qkeys, undefined)

    return (
        <>
            <header className="h-16 flex flex-cntr-between px-2 border-b border-gray60">
                <h1>Inbox</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => changeRoom("search")}
                        className="p-2 rounded-full bg-gray40">
                        <SearchIcon />
                    </button>
                    <button
                        onClick={() => changeRoom("create")}
                        className="rounded-full p-2 bg-gray40">
                        <AddIcon />
                    </button>
                </div>
            </header>

            <section className="h-full mt-2 sm:w-60 md:w-80 px-2">

                <div className="mt-4 flex flex-cntr-between">
                    <h2>Rooms</h2>
                    <button className="text-sm" onClick={() => changeRoom("invitations")}>
                        <Suspense fallback="Invitations"><InvitationsCount uid={uid} /></Suspense>
                    </button>
                </div>

                <InfiniteScroller
                    Component={RoomBar}
                    fetchData={(p) => getRooms(uid, p)}
                    onSuccess={(data) => {
                        const [first] = data.pages;
                        if (first.page === 1) setRoomList(first);
                    }}
                    placeholderData={roomList}
                    queryKeys={qkeys}
                    NotFoundSection={<NoRoomSection />}

                />
            </section>
        </>
    )
}

const RoomList = ({ uid }: { uid: string }) => {

    const { id } = useParams();

    const [page, setPage] = useState<PageType>("rooms")

    if (page === "invitations") return (
        <div className={id ? "hidden sm:block" : ''}>
            <InvitationRoomsList changeRoom={() => setPage("rooms")} uid={uid} />
        </div>
    )

    else if (page === "search") return (
        <div className={id ? "hidden sm:block" : ''}>
            <RoomSearchList goBack={() => setPage("rooms")} />
        </div>
    )

    else if (page === "create") return (
        <div className={id ? "hidden sm:block" : ''}>
            <CreateGroup goBack={() => setPage("rooms")} />
        </div>
    )

    return (
        <div className={id ? "hidden sm:block" : ''}>
            <RoomsList changeRoom={setPage} uid={uid} />
        </div>
    )

}

export default RoomList;