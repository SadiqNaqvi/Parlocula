"use client";

import { FilterTiles, InfiniteScroller } from "@components";
import { ShelfNavbar } from "@components/TopNavbar";
import { ShelfBar } from "@components/ui";
import { FullPageShelfListSkeleton, ShelfBarListSkeleton } from "@components/ui/loading";
import { getAllShelvesOfUser } from "@lib/helpers/common";
import { getQueryKeys } from "@lib/utils";
import useCurrentUser from "@store/user";

const ShelfHomePage = () => {

    const { user, isHydrated } = useCurrentUser();

    if (!isHydrated) return (
        <FullPageShelfListSkeleton heading="Shelf" />
    )

    else if (!user) return;

    return (
        <>
            <ShelfNavbar />

            <div className="my-4 px-2">
                <FilterTiles type="shelves" />
            </div>

            <section className="mt-4">
                <InfiniteScroller
                    Loading={<ShelfBarListSkeleton count={12} />}
                    Component={ShelfBar}
                    fetchData={(p) => getAllShelvesOfUser(user._id, p)}
                    queryKeys={getQueryKeys("allShelvesOfUser_uid", { uid: user._id })}
                    skipGroupInClassName
                />
            </section>
        </>
    )

}

export default ShelfHomePage;
