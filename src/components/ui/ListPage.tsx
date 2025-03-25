"use client";

import { FullList } from "@type/internal";
import { optimisedImageProps } from "@lib/constants";
import Image from "next/image";
import { getInternalPoster } from "@lib/utils";
import Navigate from "@components/Navigate";
import InfiniteScroller from "@components/InfiniteScroller";
import ListTile from "./ListTile";
import { getItems } from "@lib/actions/actions";

const fetchItems = async (id: string, page: number, filter: string) => {
    const { success, result, errCode } = await getItems(id, page, filter);
    if (!success) throw new Error(errCode);
    return result;
}

const ListPage = ({ data, filter }: { data: { list: FullList, items: any }, filter: string }) => {
    const { list, items } = data;
    return (
        <>
            <header>
                <Image
                    src={getInternalPoster({ path: list.poster, options: {} })}
                    {...optimisedImageProps.poster}
                />
                <div className="space-y-4">
                    <h1>{list.name}</h1>
                    <p className="text-sm text-zinc-500">{list.description}</p>
                    <ul className="flex items-center-gap-3">
                        <li className="text-zinc-500 text-sm">Items: {list.item_count}</li>
                        <li className="text-zinc-500 text-sm">Saved: {list.save_count}</li>
                        <li className="text-zinc-500 text-sm">{new Date(list.createdAt).toDateString()}</li>
                    </ul>
                    <Navigate goto={`/u/${list.username}`} comp="link">by {list.username}</Navigate>
                </div>
            </header>
            <InfiniteScroller
                Component={ListTile}
                queryKeys={[`list-${list._id}`]}
                fetchData={(p) => fetchItems(list._id, p, filter)}
                initialData={items}
            />
        </>
    )
}

export default ListPage;