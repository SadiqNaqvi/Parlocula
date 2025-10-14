"use client";

import { InfiniteScroller } from "@components";
import { NotFound, ThreadTile } from "@components/ui";
import { threadsByUser } from "@lib/helpers/common";
import { getQueryKeys } from "@lib/utils";
import useOfflineStore from "@store/offlineStore";
import useCurrentUser from "@store/user";
import { InfiniteQueryResponse } from "@type/internal";

const JoinedThreads = () => {

    const [threadList, setThreadList] = useOfflineStore<InfiniteQueryResponse | undefined>("joined-threads", undefined)
    const { meta } = useCurrentUser();

    if (!meta) return (
        <NotFound
            title="Nothing to see here"
            paras={["You need to log-in to see your joined threads here."]}
        />
    )

    return <InfiniteScroller
        Component={ThreadTile}
        fetchData={(p) => threadsByUser(meta.user_id, p)}
        queryKeys={getQueryKeys("threadOfUser_uid", { uid: meta.user_id })}
        onSuccess={(d) => {
            if (d.pages[0]?.page === 1)
                setThreadList(d.pages[0])
        }}
        placeholderData={threadList}
    />
}

export default JoinedThreads;