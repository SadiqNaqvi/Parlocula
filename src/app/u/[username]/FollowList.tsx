"use client";

import { InfiniteScroller, Navbar } from "@components";
import UserTile from "@components/ui/UserTile";
import { getFollowers, getFollowing, searchFollowers, searchFollowing } from "@lib/helpers/common";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { GeneralMultipleReturn } from "@type/internal";
import { useState } from "react";

type FollowType = "followers" | "following"
type Function = (...args: any) => Promise<GeneralMultipleReturn>
const config: Record<FollowType, { list: Function, search: Function }> = {
    followers: { list: getFollowers, search: searchFollowers },
    following: { list: getFollowing, search: searchFollowing },
}

const FollowList = ({ type, uid }: { type: FollowType, uid: string }) => {

    const [query, setQuery] = useState('');

    const updateQuery = (data: FormData) => {
        const q = data.get("query")?.toString();
        if (q && q.length >= 3) setQuery(q);
    }

    const Header = () => (
        <>
            <Navbar navTitle={type} />
            <header className="my-6">
                <form action={updateQuery}>
                    <input min={3} placeholder="Search username or name (min 3 characters)" />
                </form>
            </header>
        </>
    )

    if (query) return (
        <>
            <Header />
            <section>
                <InfiniteScroller
                    Component={UserTile}
                    fetchData={(p) => queryFunction(config[type].search, [query, uid, p])}
                    queryKeys={getQueryKeys(`search-${type}_uid_query`, { uid, query })}
                    paginate={false}
                />
            </section>
        </>
    )

    else return (
        <>
            <Header />
            <section>
                <InfiniteScroller
                    Component={UserTile}
                    fetchData={(p) => queryFunction(config[type].list, [uid, p])}
                    queryKeys={getQueryKeys(`${type}OfCurrentUser_uid`, { uid })}
                />
            </section>
        </>
    )

}

export default FollowList;