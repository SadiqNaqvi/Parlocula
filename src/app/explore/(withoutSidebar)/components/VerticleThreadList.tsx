"use client";

import { InfiniteScroller } from "@components";
import FilterDropdown from "@components/FiltersDropdown";
import { ThreadTile } from "@components/ui";
import { getThreadsForCinementOrArtist } from "@lib/helpers/common";
import useCurrentUser from "@store/user";

const VerticleThreadList = ({ id, filter, page }: { id: string, filter: string, page: number }) => {

    const { filterContent } = useCurrentUser();

    return (
        <>
            <header className="flex flex-cntr-between">
                <h1 className="text-xl font-semibold">Threads</h1>
                <FilterDropdown type="threads" />
            </header>
            <section className="mt-4">
                <InfiniteScroller
                    Component={ThreadTile}
                    fetchData={() => getThreadsForCinementOrArtist(id, page, !filterContent, filter)}
                    queryKeys={["threads-for-media", id, filter]}
                />
            </section>
        </>
    )

}

export default VerticleThreadList;