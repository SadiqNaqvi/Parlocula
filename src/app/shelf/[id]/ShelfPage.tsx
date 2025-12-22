"use client";

import { GenericWrapper, InfiniteScroller, Navigate } from "@components";
import FancyImage from "@components/FancyImage";
import ObserverHeader from "@components/ObserverHeader";
import { ItemTile } from "@components/ui";
import { getItems, getShelf } from "@lib/helpers/common";
import { getPoster, getQueryKeys, timeAgo } from "@lib/utils";
import { FullShelf } from "@type/internal";
import ActionButton from "./ActionButton";
import ListIcons from "@components/ui/ListIconMap";
import EllipsisButton from "./Ellipsis";
import FilterTiles from "@components/Router/FilterTIles";

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
                headerClasses="pb-4 border-b border-gray30">

                <div className="size-32">
                    {
                        shelf_type === "custom" ?
                            <FancyImage
                                id="poster"
                                height={128}
                                width={128}
                                className="size-full object-cover rounded-full"
                                thumbnail={getPoster({ external: true, type: "poster", path: poster, size: "w154" })}
                                src={getPoster({ external: true, type: "poster", path: poster, size: "original" })}
                                alt={`Poster`}
                            />
                            :
                            <ListIcons type={shelf_type} />
                    }
                </div>

                <div className="space-y-4 my-4">
                    <h1 data-observe className="text-2xl">{name}</h1>

                    <ul className="flex items-center gap-3">
                        <li className="text-zinc-500 text-sm">Items: {item_count}</li>
                        <li className="text-zinc-500 text-sm">Saved by: {saved_count}</li>
                        <li className="text-zinc-500 text-sm">{new Date(createdAt).toDateString()}</li>
                        {last_added && <li className="text-zinc-500 text-sm">Last Added: {timeAgo(last_added)}</li>}
                    </ul>

                    <Navigate goto={`/user/${username}`} comp="link">by {username}</Navigate>
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
                Component={ItemTile}
                queryKeys={getQueryKeys("itemsOfShelf_sid_filter", { sid: _id, filter })}
                fetchData={(p) => getItems(_id, uid, p, filter, key)}
                initialPage={page}
            />
        </>
    )
}

const ShelfPage = (props: Props) => GenericWrapper({ component: Component, getQueryProps, props });


export default ShelfPage;