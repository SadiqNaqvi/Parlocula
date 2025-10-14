"use client";

import { InfiniteScroller } from "@components";
import { Popover, Triggerer } from "@components/FancyboxModal";
import SearchContainer from "@components/SearchContainer";
import UserTile from "@components/ui/UserTile";
import { getMembers, searchMembers } from "@lib/helpers/common";
import { getQueryKeys, queryFunction } from "@lib/utils";

const notFoundMessage = {
    title: "Oops! Looks like you entered an vacant thread.",
    paras: ["Join this thread to see your name here."]
}

const MembersList = ({ page, tid }: { tid: string, page: number }) => {

    return (
        <>
            <header>
                <Triggerer id="search-members" className="px-4 py-2 bg-gray40 w-full rounded-md">
                    <span>Search members with username</span>
                </Triggerer>
            </header>
            <section className="mt-4">
                <InfiniteScroller
                    Component={UserTile}
                    queryKeys={getQueryKeys("members_tid_page", { tid, page })}
                    fetchData={(p) => queryFunction(getMembers, [tid, p])}
                    notFoundMessage={notFoundMessage}
                />
            </section>
            <Popover id="search-members">
                <SearchContainer
                    ComponentToShow={UserTile}
                    queryFn={(q, p) => queryFunction(searchMembers, [tid, q, p])}
                    queryKeys={(q) => ["search", "members", q]}
                />
            </Popover>
        </>
    )

}

export default MembersList;