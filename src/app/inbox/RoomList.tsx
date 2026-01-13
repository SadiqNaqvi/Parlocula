"use client";

import { AddIcon, SearchIcon } from "@assets/Icons";
import { InfiniteScroller, Navbar } from "@components";
import RoomBar from "@components/ui/RoomBar";
import { getInvitedRooms, getRooms } from "@lib/helpers/common";
import { useInfiniteQueryHook } from "@lib/hooks";
import { getQueryKeys, infiniteScrollerResponse } from "@lib/utils";
import useOfflineStore from "@store/offlineStore";
import { InfiniteQueryResponse } from "@type/internal";
import { TypedFunction } from "@type/other";
import { useParams } from "next/navigation";
import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import CreateGroup from "./CreateGroup";
import InvitationRoomsList from "./InvitationRoomList";
import RoomSearchList from "./RoomSearchList";
import useRoomStore from "@store/roomStore";
import useCurrentUser from "@store/user";
import { LoadingSpinner, ShowError } from "@components/ui";
import { storeRoomList } from "@lib/helpers/redis/messaging";

type PageType = "rooms" | "invitations" | "search" | "create";

const NoRoomSection = () => (
    <div className="mt-8">
        <h2 className="text-center text-xl font-semibold">No chats yet?</h2>
        <p className="text-center mt-2">Click on the + icon and start chatting</p>
    </div>
)

const InvitationsCount = ({ uid }: { uid: string }) => {
    const { data } = useInfiniteQueryHook({
        queryFn: () => getInvitedRooms(uid, 1),
        queryKeys: getQueryKeys("roomInvitations_uid", { uid }),
    });

    if (!data || !data.pages[0]?.total_results) return "Invitations"

    return `Invitations ${data.pages[0].total_results || ''}`
}

const RoomListWrapper = ({ id, children }: PropsWithChildren<{ id: string | string[] | undefined }>) => (
    <div className={id ? "hidden sm:block" : ''}>
        {children}
    </div>
)

const RoomsList = ({ uid, changeRoom }: { uid: string, changeRoom: TypedFunction<PageType> }) => {

    const qkeys = getQueryKeys("rooms_uid", { uid });
    const { room, setRooms } = useRoomStore();
    const { isHydrated, dataSaver } = useCurrentUser();
    const [roomList, setRoomList] = useOfflineStore<InfiniteQueryResponse<any> | undefined>(qkeys, undefined);
    const container = useRef<HTMLDivElement>(null);

    const { data, isError, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = useInfiniteQueryHook<string>({
        queryFn: (p) => getRooms(uid, p).then(response => {
            const { success, errCode, result } = response;
            if (!success) return { success, errCode }

            else if (p === 1) setRoomList(infiniteScrollerResponse(result, 1));

            const ids = setRooms(result.data);
            return { success, result: { data: ids, total: result.total } };
        }),
        queryKeys: qkeys,
        placeholderData: roomList && {
            ...roomList,
            results: setRooms(roomList?.results || [])
        },
        initialPage: 1,
    });

    useEffect(() => {
        if (!isHydrated || dataSaver) return;

        const current = container.current;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !isFetchingNextPage && hasNextPage)
                fetchNextPage();
        }, { threshold: 0.1 })

        if (current && hasNextPage) observer.observe(current);

        return () => {
            if (current) observer.unobserve(current);
        }
    }, [dataSaver, isHydrated]);

    const rooms = React.useMemo(() =>
        data?.pages
            .flatMap(result => Array.from(new Set(result.results)))
            .map(room_id => room[room_id])
            .filter(Boolean)
            .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()),
        [data, room]);

    const manuallyLoadNextPage = () => {
        fetchNextPage();
    }

    if (isLoading) return <LoadingSpinner />

    else if (isError) return (
        <ShowError
            retry={refetch}
            heading="Unable to fetch the resource you're looking for"
        />
    )

    else if (!rooms.length) return (
        <div className="forceCenter space-y-2">
            <h2>No rooms yet</h2>
            <p>Click on the + icon and start chatting</p>
        </div>
    )

    return (
        <>
            <Navbar
                OptionButton={
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
                }
                navTitle="Inbox"
            />

            <section className="h-full mt-2 sm:w-60 md:w-80 px-2">

                <div className="mt-4 flex flex-cntr-between">
                    <h2>Rooms</h2>
                    <button className="text-sm" onClick={() => changeRoom("invitations")}>
                        <InvitationsCount uid={uid} />
                    </button>
                </div>

                <ul>
                    {rooms.map(room => (
                        <li key={room.room_id}>
                            <RoomBar {...room} _id={room.room_id} />
                        </li>
                    ))}
                </ul>
                {hasNextPage &&
                    ((isHydrated && !dataSaver) || isFetchingNextPage ?
                        <div ref={container} className="mt-4 py-2">
                            <LoadingSpinner />
                        </div>
                        :
                        <div className="w-full flex flex-cntr-all">
                            <button className="primary" onClick={manuallyLoadNextPage}>Load More</button>
                        </div>
                    )
                }

            </section>
        </>
    )
}

const RoomList = ({ uid }: { uid: string }) => {

    const { id } = useParams();

    const [page, setPage] = useState<PageType>("rooms");

    const handleBack = () => setPage("rooms");

    if (page === "invitations") return (
        <RoomListWrapper id={id}>
            <InvitationRoomsList changeRoom={handleBack} uid={uid} />
        </RoomListWrapper>
    )

    else if (page === "search") return (
        <RoomListWrapper id={id}>
            <RoomSearchList uid={uid} goBack={handleBack} />
        </RoomListWrapper>
    )

    else if (page === "create") return (
        <RoomListWrapper id={id}>
            <CreateGroup goBack={handleBack} />
        </RoomListWrapper>
    )

    return (
        <RoomListWrapper id={id}>
            <RoomsList changeRoom={setPage} uid={uid} />
        </RoomListWrapper>
    )

}

export default RoomList;