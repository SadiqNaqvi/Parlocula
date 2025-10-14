"use client";

import { closeFancyBox } from "@components/FancyboxModal";
import GeneralTile from "@components/GeneralTile";
import SearchContainer from "@components/SearchContainer";
import { searchOnlyMediaItems } from "@lib/contentFetcher";
import { addItemsToList } from "@lib/helpers/client";
import { addingItemsMutation, mutationWrapper } from "@lib/mutation";
import { getPoster } from "@lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MediaItemType } from "@type/internal";
import { InputMediaType } from "@type/schemas";
import { useState } from "react";
import toast from "react-hot-toast";

const Search = ({ queryKeys, list_id, uid }: { queryKeys: string[], list_id: string, uid: string }) => {

    const [items, setItems] = useState<InputMediaType[]>([]);

    const queryClient = useQueryClient();

    const mutationFn = async (items: InputMediaType[]) => {
        closeFancyBox();
        const done = await addItemsToList(list_id, { items }, uid);
        if (!done) throw new Error();
    }

    const mutation = useMutation(mutationWrapper({
        mutationFn,
        optimisticWork: addingItemsMutation,
        queryClient,
        queryKeys
    }));

    const submit = () => {
        mutation.mutate(items);
    };

    const getItems = (item: InputMediaType) => {
        if (items.length > 50) {
            toast.error("At most 50 items are allowed to add at once.");
            return;
        }
        const itemSet = new Set(items);
        itemSet.add(item);
        if (itemSet.size === items.length) return;
        setItems(Array.from(itemSet));
    }

    const CheckItemTile = ({ media_type, poster, title, tmdb_id, year }: MediaItemType) => {
        return <GeneralTile
            title={title}
            onClick={() => getItems({ media_type, poster, title, tmdb_id, year, isConfirm: false })}
            poster={getPoster({ external: true, type: "poster", path: poster, size: "w92" })}
        />
    }

    const Wrapper = ({ children }: { children: React.ReactNode }) => {
        return (
            <div className="forceCenter justify-start flex-col group overflow-y-auto">
                {children}
                <div className="w-full px-2 items-center py-2 space-y-2 sticky bottom-0 bg-primarylight mt-2 hidden group-has-[#infiniteScroller]:flex">
                    <ul className="flex gap-2 overflow-x-auto noScroll h-fit">
                        {items.map(el => (
                            <li key={el.tmdb_id} className="px-2 text-nowrap py-1 bg-gray30 rounded-md">{el.title}</li>
                        ))}
                    </ul>
                    <button className="secondary ml-auto" onClick={submit}>Save</button>
                </div>
            </div>
        )
    }

    return <SearchContainer
        ComponentToShow={CheckItemTile}
        queryFn={searchOnlyMediaItems}
        queryKeys={(q) => ["search-cinements", q]}
        Wrapper={Wrapper}
    />
}

export default Search;