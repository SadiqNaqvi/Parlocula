"use client";

import { InfiniteScroller, Navbar } from "@components";
import RoomBar from "@components/ui/RoomBar";
import { searchRooms } from "@lib/helpers/common";
import useCurrentUser from "@store/user";
import { useState } from "react";

const RoomSearchList = ({ goBack }: { goBack: () => void }) => {

    const [query, setQuery] = useState('');
    const { meta } = useCurrentUser();

    if (!meta) return null;

    const updateQuery = (data: FormData) => {
        const input = data.get("query")?.toString().trim();

        if (!input || input.length < 3) return;

        setQuery(input);
    }

    const Header = () => (
        <>
            <Navbar onGoBack={goBack} navTitle="Search" />
            <form action={updateQuery} className="inline flex-1">
                <input defaultValue={query} placeholder="Search rooms" className="w-stretch py-1" maxLength={25} />
            </form>
        </>
    )

    if (!query) return (
        <>
            <Header />
            <section className="h-stretch flex p-2 flex-cntr-all flex-col">
                <p className="text-center">Search Rooms (min 3 characters)</p>
            </section>
        </>
    )

    return (
        <>
            <Header />
            <section className="p-2">
                <InfiniteScroller
                    fetchData={(p) => searchRooms(meta.user_id, query, p)}
                    Component={RoomBar}
                    queryKeys={['search', 'rooms', `query-${query}`]}
                />
            </section>
        </>
    )
}

export default RoomSearchList;