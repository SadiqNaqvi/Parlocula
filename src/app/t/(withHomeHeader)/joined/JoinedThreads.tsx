"use client";

import { InfiniteScroller } from "@components";
import { LoadingSpinner, NotFound, ThreadTile } from "@components/ui";
import { threadsByUser } from "@lib/helpers/common";
import { generateInitialData, getQueryKeys, queryFunction } from "@lib/utils";
import useCurrentUser from "@store/user";

const JoinedThreads = () => {

    const { threads, user, isHydrated } = useCurrentUser();

    if (!isHydrated) return <LoadingSpinner />

    else if (!user) return (
        <NotFound
            title="Nothing to see here"
            paras={["You need to log-in to see your joined threads here."]}
        />
    )

    return <InfiniteScroller
        Component={ThreadTile}
        fetchData={(p) => queryFunction(threadsByUser, [user._id, p], p)}
        queryKeys={getQueryKeys("threadOfUser_uid", { uid: user._id })}
        initialData={generateInitialData(threads)}
    />
}

export default JoinedThreads;