"use client";

import { GenericWrapper, InfiniteScroller, Navigate } from "@components";
import FancyImage from "@components/FancyImage";
import ObserverHeader from "@components/ObserverHeader";
import { ItemTile } from "@components/ui";
import ListIcons from "@components/ui/ListIconMap";
import { getPoster } from "@lib/dataRefiner";
import { getItems, getList } from "@lib/helpers/common";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { FullList } from "@type/internal";
import ActionButton from "./ActionButton";

type Props = {
    id: string,
    filter: string,
    page: number,
    uid: string | undefined,
}

const getQueryProps = ({ id }: Props) => ({
    queryKeys: getQueryKeys("list_lid", { lid: id }),
    queryFn: getList,
    args: [id],
});

const component = (data: FullList, { filter, page, uid }: Props) => {
    const { _id, createdAt, isPrivate, item_count, key, last_added, list_type, name, poster, saved_count, user_id, username } = data;

    return (
        <>
            <ObserverHeader
                titleToShare={`Check out this "${name}" list by ${username} - Popcorn Paragon`}
                urlToShare={isPrivate ? `/l/private/${_id}?k=${key}` : undefined}
                navTitle={name}
                headerClasses="pb-4 border-b border-gray30">
                <div className="size-32">
                    {
                        list_type === "custom" ?
                            <FancyImage
                                id="poster"
                                height={128}
                                width={128}
                                className="size-full object-cover rounded-full"
                                thumbnail={getPoster("poster", poster, 2)}
                                src={getPoster("poster", poster, 10)}
                                alt={`Poster`}
                            />
                            :
                            <ListIcons type={list_type.toLowerCase()} />
                    }
                </div>

                <div className="space-y-4 my-4">
                    <h1 data-observe className="text-2xl">{name}</h1>
                    <ul className="flex items-center gap-3">
                        <li className="text-zinc-500 text-sm">Items: {item_count}</li>
                        <li className="text-zinc-500 text-sm">Saved: {saved_count}</li>
                        <li className="text-zinc-500 text-sm">{new Date(createdAt).toDateString()}</li>
                    </ul>
                    <Navigate goto={`/u/${username}`} comp="link">by {username}</Navigate>
                </div>

                <ActionButton
                    cuid={uid}
                    saved_count={saved_count}
                    author={user_id}
                    filter={filter}
                    id={_id}
                    isPrivate={isPrivate}
                />

            </ObserverHeader >

            <InfiniteScroller
                className="mt-6 space-y-4"
                Component={ItemTile}
                queryKeys={getQueryKeys("itemsOfList_lid_filter_page", { lid: _id, filter, page })}
                fetchData={(p) => queryFunction(getItems, [_id, p, filter])}
            />
        </>
    )
}

const ListPage = (props: Props) => GenericWrapper({ component, getQueryProps, props });


export default ListPage;