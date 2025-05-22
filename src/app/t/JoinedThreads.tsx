"use client";

import { InfiniteScroller } from "@components";
import { LoadingSpinner, NotFound, ThreadTile } from "@components/ui";
import { queryLimit } from "@lib/constants";
import { threadsByUser } from "@lib/helpers/client";
import useCurrentUser from "@store/user";

const queryFn = async (uid: string | undefined, page: number) => {
    if (!uid) throw new Error("pp202");
    const { success, errCode, result } = await threadsByUser(uid, page);
    if (!success) throw new Error(errCode);
    return result;
}

const JoinedThreads = () => {

    const { threads, user, isHydrated } = useCurrentUser();

    if (!isHydrated) return <LoadingSpinner />

    else if (!user) return (
        <NotFound title="Nothing to see here" paras={["You need to log-in to see your joined threads here."]} />
    )

    return <InfiniteScroller
        Component={ThreadTile}
        fetchData={(p) => queryFn(user._id, p)}
        queryKeys={[`threadsByCurrentUser`]}
        initialData={{ data: threads, total: threads.length < queryLimit ? threads.length : queryLimit }}
    />
}

export default JoinedThreads;