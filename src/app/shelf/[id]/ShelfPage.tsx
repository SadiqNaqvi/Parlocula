"use client";

import { FancyImage, FilterTiles, GenericWrapper, InfiniteScroller, Navigate, ObserverHeader } from "@components";
import { ShelfItemBar, MetadataTile } from "@components/ui";
import { getItems, getShelf } from "@lib/helpers/common";
import { getPoster, getQueryKeys, timeAgo } from "@lib/utils";
import { FullShelf } from "@type/internal";
import ActionButton from "./ActionButton";
import EllipsisButton from "./Ellipsis";
import ShelfPoster from "@components/ui/ShelfPoster";

type Props = {
    id: string,
    filter: string,
    page: number,
    uid: string | undefined,
    key: string | undefined,
}

const getQueryProps = ({ id, key, uid }: Props) => ({
    queryKeys: getQueryKeys("shelf_sid", { sid: id }),
    queryFn: getShelf,
    args: [id, uid, key],
});

const Component = (data: FullShelf, { filter, page, uid, key }: Props) => {

    const { _id, createdAt, isPrivate, item_count, shelfKey, last_added, shelf_type, name, poster, saved_count, user_id, username } = data;

    return (
        <>
            <ObserverHeader
                titleToShare={`Check out this Shelf "${name}" by ${username} - Parlocula`}
                urlToShare={`/shelf/${_id}${shelfKey ? `?k=${shelfKey}` : ''}`}
                OptionButton={<EllipsisButton isPrivate={isPrivate} author={user_id} id={_id} />}
                navTitle={name}
                className="pb-4 border-b border-gray30 px-2">

                <section className="flex gap-4 items-center">
                    <ShelfPoster
                        fancy
                        className="min-w-24 size-24 sm:min-w-32 sm:size-32"
                        useClassNameForBoth
                        name={name}
                        poster={poster}
                        shelf_type={shelf_type}
                    />

                    <div className="space-y-2">
                        <h1 data-observe className="text-lg sm:text-2xl capitalize font-semibold">{name}</h1>
                        <p className="text-sm text-zinc-500 space-x-1">
                            <span>Created by:</span>
                            <Navigate goto={`/user/${username}`} comp="link">{username}</Navigate>
                        </p>
                    </div>
                </section>

                <div className="space-y-4 my-4">
                    <MetadataTile
                        createdAt={createdAt}
                        others={[
                            { value: `Items: ${item_count}`, condition: item_count ?? false },
                            { value: `Saved by: ${saved_count}`, condition: saved_count ?? false },
                            { value: `Last Added: ${timeAgo(last_added)}`, condition: last_added ?? false }
                        ]}
                    />
                </div>

                <ActionButton
                    cuid={uid}
                    saved_count={saved_count}
                    author={user_id}
                    id={_id}
                    isPrivate={isPrivate}
                />

            </ObserverHeader>

            <div className="my-2">
                <FilterTiles type="items" />
            </div>

            <InfiniteScroller
                className="mt-6 space-y-4"
                Component={ShelfItemBar}
                queryKeys={getQueryKeys("itemsOfShelf_sid_filter", { sid: _id, filter })}
                fetchData={(p) => getItems(_id, uid, p, filter, key)}
                initialPage={page}
            />
        </>
    )
}

const ShelfPage = (props: Props) => GenericWrapper({ component: Component, getQueryProps, props });


export default ShelfPage;