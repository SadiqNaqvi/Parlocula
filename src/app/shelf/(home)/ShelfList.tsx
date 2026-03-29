"use client";

import { InfiniteScroller, Navbar, FilterTiles } from "@components"
import { OptionalChildren } from "@components/ui";
import { ShelfBarListSkeleton } from "@components/ui/loading";
import ShelfBar from "@components/ui/ShelfBar";
import { getPrivateShelvesOfUser, getShelvesAsCollaborator, getShelvesAsInvitee, getShelvesOfUser } from "@lib/helpers/common";
import { getQueryKeys, refineSearchParams } from "@lib/utils";

type ShelfListCategory = "public" | "private" | "collaborative" | "invited";

type KeysAndFn = { queryKeys: string[], queryFn: (p: number) => any }

const getQueryKeyAndFn = (type: ShelfListCategory, uid: string, filter: string): KeysAndFn => {
    if (type === "collaborative") return {
        queryKeys: getQueryKeys("collaboratedShelvesOfUser_uid", { uid }),
        queryFn: (p) => getShelvesAsCollaborator(uid, p)
    }

    else if (type === "invited") return {
        queryFn: (p) => getShelvesAsInvitee(uid, p),
        queryKeys: getQueryKeys("invitedShelvesOfUser_uid", { uid })
    }

    else if (type === "private") return {
        queryFn: (p) => getPrivateShelvesOfUser(uid, p),
        queryKeys: getQueryKeys("privateShelvesOfUser_uid", { uid })
    }

    else return {
        queryFn: (p) => getShelvesOfUser(uid, p, filter),
        queryKeys: getQueryKeys("shelvesOfUser_uid_filter", { uid, filter })
    }
}

type Props = {
    title: string,
    type: ShelfListCategory,
    uid: string,
    filter?: string
}

const ShelfList = ({ title, uid, type, filter }: Props) => {

    const correctFilter = refineSearchParams("shelves", '', filter).filter;

    const { queryFn, queryKeys } = getQueryKeyAndFn(type, uid, correctFilter);

    return (
        <>
            <Navbar navTitle={title} />

            <OptionalChildren condition={filter}>
                <div className="my-4">
                    <FilterTiles type="shelves" />
                </div>
            </OptionalChildren>

            <section className="mt-4">
                <InfiniteScroller
                    Loading={<ShelfBarListSkeleton count={12} />}
                    Component={ShelfBar}
                    fetchData={queryFn}
                    queryKeys={queryKeys}
                />
            </section>
        </>
    )
}

export default ShelfList;