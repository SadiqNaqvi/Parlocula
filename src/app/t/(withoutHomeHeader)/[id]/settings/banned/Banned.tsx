"use client"

import { AddIcon, CheckIcon, EditIcon } from "@assets/Icons";
import { InfiniteScroller, Navbar } from "@components";
import { NormalCheckTile } from "@components/form/CheckAndRadioTile";
import { ActionSearchContainer } from "@components/SearchContainer";
import UserTile from "@components/ui/UserTile";
import { blockOrBanLimit } from "@lib/constants";
import { getBannedMembers, searchBannedMembers, searchMembers } from "@lib/helpers/common";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { MereUser } from "@type/internal";
import { PropsWithChildren, useState } from "react";

const UserCheckTile = ({ _id, username }: MereUser) =>
    <NormalCheckTile label={username} name={_id} type="checkbox" />

const sanitizeFn = ({ _id, username, profile }: MereUser) => ({
    label: username,
    data: { _id },
    poster: profile,
});

const List = ({ tid, uid, editing, query }: { tid: string, uid: string, editing: boolean, query: string }) => {

    const qFn = query ? searchBannedMembers : getBannedMembers;
    const args = query ? [tid, uid, query] : [tid, uid];
    const queryKeys = query ? getQueryKeys("bannedMembers_tid", { tid }) : getQueryKeys("searchBannedMembers_tid_query", { tid, query })

    return (
        <InfiniteScroller
            Component={editing ? UserCheckTile : UserTile}
            fetchData={(p) => queryFunction(qFn, [...args, p])}
            queryKeys={queryKeys}
            notFoundMessage={{
                title: "No banned users",
                paras: ["Click the plus icon to ban users"]
            }}
        />
    )
}

const BannedList = ({ tid, uid }: { tid: string, uid: string }) => {
    const [query, setQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const updateQuery = (data: FormData) => {
        const q = data.get("query")?.toString();
        if (q && (q.length === 0 || q.length >= 3)) setQuery(q);
    }

    if (isEditing) return (
        <>
            <Navbar navTitle="Select to Unban"
                OptionButton={<button><CheckIcon /></button>}
            />
            <header>
                <form action={updateQuery}>
                    <input defaultValue={query} className="py-2 px-4 w-full bg-primaryLight rounded-md" placeholder="Search banned users" type="search" />
                </form>
            </header>
            <form action={console.log}>
                <List editing={isEditing} query={query} tid={tid} uid={uid} />
            </form>
        </>
    )

    return (
        <>
            <Navbar navTitle="Banned" OptionButton={
                <div className="space-x-2">
                    <button onClick={() => setIsEditing(true)}><EditIcon /></button>
                    <ActionSearchContainer
                        queryFn={(q, p) => searchMembers(tid, q, p)}
                        actionButton="Remove"
                        queryKeys={q => getQueryKeys("searchMembers_tid_query", { query: q, tid })}
                        action={console.log}
                        sanitize={sanitizeFn}
                        placeholder="Search Members to Un-Ban"
                        limit={blockOrBanLimit}
                    >
                        <AddIcon />
                    </ActionSearchContainer>
                </div>
            } />
            <header>
                <form action={updateQuery}>
                    <input defaultValue={query} className="py-2 px-4 w-full bg-primaryLight rounded-md" placeholder="Search banned users" type="search" />
                </form>
            </header>
            <section>
                <List editing={isEditing} query={query} tid={tid} uid={uid} />
            </section>
        </>
    )
}
export default BannedList;