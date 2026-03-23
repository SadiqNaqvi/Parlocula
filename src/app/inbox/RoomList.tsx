"use client";

import { AddIcon, SearchIcon } from "@assets/Icons";
import { Navbar } from "@components";
import { LoadingSpinner, ShowError } from "@components/ui";
import { RichRoomBar } from "@components/ui/RoomBar";
import { getInvitedRoomsCount, getRooms } from "@lib/helpers/common";
import { useInfiniteQueryHook, useQueryHook } from "@lib/hooks";
import { getQueryKeys } from "@lib/utils";
import useOfflineStore from "@store/offlineStore";
import useRoomStore from "@store/roomStore";
import useCurrentUser from "@store/user";
import { InfiniteQueryResponse, MereRoomType } from "@type/internal";
import { TypedFunction } from "@type/other";
import { useParams } from "next/navigation";
import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import CreateGroup from "./CreateGroup";
import InvitationRoomsList from "./InvitationRoomList";
import RoomSearchList from "./RoomSearchList";
import { RoomBarSkeleton } from "@components/ui/loading";

type PageType = "rooms" | "invitations" | "search" | "create";

const InvitationsCount = ({ uid }: { uid: string }) => {
    const { data } = useQueryHook({
        queryFn: () => getInvitedRoomsCount(uid),
        queryKeys: getQueryKeys("roomInvitationsCount_uid", { uid }),
    });

    if (!data) return "Invitations"

    return `Invitations ${data}`
}

type RoomListProps = { uid: string, changeRoom: TypedFunction<PageType> };

const RoomListHeader = ({ changeRoom, uid }: RoomListProps) => (
    <>
        <Navbar
            OptionButton={(
                <div className="flex gap-3">
                    <button
                        onClick={() => changeRoom("search")}
                        className="p-2 rounded-full bg-gray10 border border-gray20">
                        <SearchIcon className="size-4" />
                    </button>
                    <button
                        onClick={() => changeRoom("create")}
                        className="rounded-full p-2 bg-gray10 border border-gray20">
                        <AddIcon className="size-4" />
                    </button>
                </div>
            )}
            navTitle="Inbox"
            className="px-2"
        />
        <header className="px-2 mt-4 flex flex-cntr-between">
            <h2>Rooms</h2>
            <button className="text-sm" onClick={() => changeRoom("invitations")}>
                <InvitationsCount uid={uid} />
            </button>
        </header>
    </>
)

const RoomsList = ({ uid, changeRoom }: RoomListProps) => {

    const qkeys = getQueryKeys("rooms_uid", { uid });
    const { setRooms } = useRoomStore.getState();
    const { isHydrated, dataSaver } = useCurrentUser();
    const [roomList, setRoomList] = useOfflineStore<InfiniteQueryResponse<any> | undefined>(qkeys, undefined);
    const container = useRef<HTMLDivElement>(null);

    const { data, isError, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = useInfiniteQueryHook<MereRoomType>({
        queryFn: (p) => getRooms(uid, p),
        onSuccess: (response) => {
            console.log("onSuccess me aaya");
            const { pages, pageParams } = response;

            const [firstPage] = pages;
            setRooms(pages.flatMap(page => page.results));

            if (pageParams.length === 1 && pageParams[0] === 1)
                setRoomList(firstPage);
        },
        queryKeys: qkeys,
        placeholderData: roomList ? {
            ...roomList,
            results: roomList.results.map(el => el.room_id)
        } : undefined,
        initialPage: 1,
    });

    useEffect(() => {
        setRooms(roomList?.results || []);
        // roomMeta.current = { ...roomMeta.current, ...resultsToRecord(roomList?.results || []) };
    }, [roomList]);

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

    const rooms = React.useMemo(() => {
        return Array.from(new Set(data?.pages?.flatMap(result => result.results)
            .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
            .map(r => r.room_id)));
    },
        [data]);

    const manuallyLoadNextPage = () => {
        fetchNextPage();
    }

    if (isLoading) return (
        <>
            <RoomListHeader uid={uid} changeRoom={changeRoom} />
            <div className="space-y-2 overflow-hidden">
                {Array(10).fill(0).map((_, i) => (
                    <RoomBarSkeleton key={i} />
                ))}
            </div>
        </>
    )

    else if (isError) return (
        <>
            <RoomListHeader uid={uid} changeRoom={changeRoom} />

            <ShowError
                retry={refetch}
                heading="Unable to fetch the resource you're looking for"
            />
        </>
    )

    else if (!rooms.length) return (
        <>
            <RoomListHeader uid={uid} changeRoom={changeRoom} />
            <div className="flex-1 flex flex-col flex-cntr-all space-y-2">
                <h2>No rooms yet</h2>
                <p>Click on the + icon and start chatting</p>
            </div>
        </>
    )

    return (
        <>
            <RoomListHeader uid={uid} changeRoom={changeRoom} />

            <section className="mt-2 px-2">
                <ul>
                    {rooms.map(rmid => (
                        <li key={rmid}>
                            <RichRoomBar room_id={rmid} />
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

const RoomListWrapper = ({ id, children }: PropsWithChildren<{ id: string | string[] | undefined }>) => (
    <div className={twMerge("md:border-r border-gray20 w-full flex flex-col md:max-w-96 border-right border-gray30 overflow-y-auto", id ? "hidden md:block" : '')}>
        {children}
    </div>
)

const RoomListSection = ({ uid }: { uid: string }) => {

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

export default RoomListSection;