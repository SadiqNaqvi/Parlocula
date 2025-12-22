"use client";

import { Navbar, SearchInList } from "@components";
import RoomBar from "@components/ui/RoomBar";
import { searchRooms } from "@lib/helpers/common";
import { TypedFunction } from "@type/other";

const RoomSearchList = ({ goBack, uid }: { goBack: TypedFunction, uid: string }) => {

    return (
        <>
            <Navbar navTitle="Search Rooms" onGoBack={goBack} />
            <SearchInList
                Component={RoomBar}
                queryFn={(q, p) => searchRooms(uid, q, p)}
                queryKeys={(q) => ["search", "rooms", q]}
            />
        </>
    )
}

export default RoomSearchList;