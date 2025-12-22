"use client";

import { InfiniteScroller, Navbar, SearchInList } from "@components";
import UserBar from "@components/ui/UserBar";
import { getMembers, searchMembers } from "@lib/helpers/common";
import { getQueryKeys } from "@lib/utils";
import { useState } from "react";

const notFoundMessage = {
    title: "Oops! Looks like you entered an vacant thread.",
    paras: ["Join this thread to see your name here."]
}

const MembersList = ({ tid }: { tid: string }) => (
    <>
        <Navbar navTitle="Members" />
        <section className="mt-4">
            <SearchInList
                Component={UserBar}
                queryKeysForList={getQueryKeys("members_tid", { tid })}
                queryFnForList={(p) => getMembers(tid, p)}
                queryFn={(q, p) => searchMembers(tid, q, p)}
                queryKeys={(query) => getQueryKeys("searchMembers_tid_query", { tid, query })}
                notFoundMessage={notFoundMessage}
            />
        </section>
    </>
)

export default MembersList;