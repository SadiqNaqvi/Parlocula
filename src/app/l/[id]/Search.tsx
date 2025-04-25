"use client";

import { InfiniteScroller } from "@components";
import { CheckTile } from "@components/form";
import { searchOnlyMediaItems } from "@lib/contentFetcher";
import { useCustomReducer } from "@lib/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MediaItemType } from "@type/internal";
import toast from "react-hot-toast";

const CheckItemTile = ({ media_type, poster, title, tmdb_id, year }: MediaItemType) => {
    return <CheckTile lable={`${title} (${year})`} name={JSON.stringify({ media_type, poster, title, tmdb_id, year })} />
}

type MutationProps = { id: string, items: MediaItemType[] }

const mutationFn = async ({ id, items }: MutationProps) => {
    // const error = await addItemsToList(id, { items });
    // if (error) {
    //     toast.error(error);
    //     throw new Error();
    // }
}

const Search = ({ queryKeys, list_id, close }: { queryKeys: string[], list_id: string, close: () => void }) => {

    const { query, itemsToAdd, items, setter } = useCustomReducer({
        query: "",
        itemsToAdd: new Map<string, MediaItemType>(),
        items: [] as (MediaItemType & { isConfirm: boolean })[],
    });
    const queryClient = useQueryClient();

    const queryFn = async (page = 1) => {
        const data = await searchOnlyMediaItems(query, page);
        if (!data.success) throw new Error(data.errCode);
        return data.result;
    }

    const mutation = useMutation({
        mutationFn,
        onMutate: async ({ items }: MutationProps) => {
            await queryClient.cancelQueries({ queryKey: queryKeys });

            const previousData = queryClient.getQueryData(queryKeys);

            queryClient.setQueryData(queryKeys, (oldData: any) => {
                if (!oldData) return oldData;

                const newData = oldData.pages;
                newData[0] = items.concat([newData[0]]);

                return { ...oldData, pages: newData };
            });

            close();
            return { previousData };
        }
    });

    const submit = () => mutation.mutate({ id: list_id, items });

    const onQueryChange = (data: FormData) => {
        const searchQuery = data.get("query") as string | undefined;
        if (!searchQuery || searchQuery.length < 3) return;
        setter({ query: searchQuery });
    }

    const updateItemsToAdd = (data: FormData) => {
        if (itemsToAdd.size > 50) {
            toast.error("At most 50 items are allowed to add at once.");
            return;
        }
        const temp = itemsToAdd;
        data.entries().forEach(entry => {
            const doc = JSON.parse(entry[0]);
            temp.set(doc.tmdb_id, doc)
        });

        setter({ itemsToAdd: temp, items: temp.values().map(el => ({ ...el, isConfirm: false })).toArray() });
    }

    return (
        <div className="bg-primarylight size-[600px] max-h-full max-w-full m-auto overflow-y-auto border border-gray20 rounded-md">
            <header className="w-full sticky top-0 bg-primarylight p-4">
                <form action={onQueryChange}>
                    <input type="search" name="query"
                        placeholder="Search Cinements here"
                        className="w-full px-4 py-2 bg-gray30 rounded-md" />
                </form>
            </header>
            {query ?
                <>
                    <form className="stretchContainer peer px-4" action={updateItemsToAdd}>
                        <InfiniteScroller
                            Component={CheckItemTile}
                            fetchData={queryFn}
                            queryKeys={[`cinements-${query}`]}
                            paginate={false}
                        />
                        <div className="w-full p-2 space-y-2 sticky bottom-0 bg-primarylight mt-2 hidden peer-has-[#infiniteScroller]:block">
                            <ul className="flex gap-2 overflow-x-auto noScroll">
                                {items.map(el => (
                                    <li key={el.tmdb_id} className="px-2 text-nowrap py-1 bg-gray30 rounded-md">{el.title}</li>
                                ))}
                            </ul>
                            <div className="flex gap-4">
                                <button disabled={itemsToAdd.size >= 50} className="primary flex-1" type="submit">Update</button>
                                <button className="secondary flex-1" onClick={submit}>Save</button>
                            </div>
                        </div>
                    </form>
                </>
                :
                <section className="stretchContainer m-4 mt-0 rounded-md border border-gray30 border-dashed p-6">
                    <p>Search cinements by their name to see the result here</p>
                </section>
            }
        </div>
    )
}

export default Search;