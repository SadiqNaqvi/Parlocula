"use client";

import ActionButton from "@app/l/[id]/ActionButton";
import Search from "@app/l/[id]/Search";
import { InfiniteScroller, Modal, Navigate } from "@components";
import { ItemCheckTile, ItemTile } from "@components/ui";
import { optimisedImageProps } from "@lib/constants";
import { getPoster } from "@lib/dataRefiner";
import { getItems } from "@lib/helpers/common";
import { useCustomReducer } from "@lib/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FullList, InfiniteQueryResponse } from "@type/internal";
import Image from "next/image";

const fetchItems = async (id: string, page: number, filter: string) => {
    const { success, result, errCode } = await getItems(id, page, filter);
    if (!success) throw new Error(errCode);
    return result;
}

const ListPage = ({ data, filter }: { data: FullList, filter: string }) => {
    const list = data;
    const queryClient = useQueryClient();

    const { isDeleting, modal, setter } = useCustomReducer({
        modal: false,
        isDeleting: false,
    });

    const mutationFn = async (data: any) => {
        console.log(data);
        // const error = await deleteMultipleItemsFromList(list._id, data);
        // if (error) throw new Error();
    }

    const mutation = useMutation({
        mutationFn,
        onMutate: async (ids: any[]) => {
            await queryClient.cancelQueries({ queryKey: ["list", list._id] });

            const previousData = queryClient.getQueryData(["list", list._id]);
            const idMap = new Map<string, boolean>(ids.map(id => [id, true]))

            queryClient.setQueryData(["list", list._id], (oldData: any) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    pages: oldData.pages.map((page: InfiniteQueryResponse) => ({
                        ...page,
                        results: page.results.filter((result) => !idMap.get(result._id)),
                    })),
                };
            });
            setter({ isDeleting: false });

            return { previousData };
        }
    });

    const submit = (formData: FormData) => {
        const ids = formData.keys().map(el => el).toArray();
        mutation.mutate(ids);
    }

    return (
        <>
            <header className="pb-4 border-b border-gray30">
                <Image
                    src={getPoster("poster", list.poster, 4)}
                    {...optimisedImageProps.poster}
                />

                <div className="space-y-4 my-4">
                    <h1 className="text-2xl">{list.name}</h1>
                    <ul className="flex items-center gap-3">
                        <li className="text-zinc-500 text-sm">Items: {list.item_count}</li>
                        <li className="text-zinc-500 text-sm">Saved: {list.save_count}</li>
                        <li className="text-zinc-500 text-sm">{new Date(list.createdAt).toDateString()}</li>
                    </ul>
                    <Navigate goto={`/u/${list.username}`} comp="link">by {list.username}</Navigate>
                </div>

                <ActionButton
                    author={list.user_id}
                    deletionModal={() => setter({ modal: false, isDeleting: true })}
                    disabled={isDeleting || modal}
                    id={list._id}
                    isPrivate={list.isPrivate}
                    searchModal={() => setter({ modal: true, isDeleting: false })}
                />

            </header>

            <InfiniteScroller
                className="mt-6 space-y-4"
                Component={ItemTile}
                queryKeys={["list", list._id]}
                fetchData={(p) => fetchItems(list._id, p, filter)}
            />

            {/* Modal For deleting items from the list */}
            <Modal open={isDeleting} close={() => setter({ isDeleting: false })}>
                <section className="size-[600px] p-6 overflow-y-auto bg-primarylight border border-dashed border-gray30 rounded-md">
                    <form action={submit}>
                        <InfiniteScroller
                            Component={ItemCheckTile}
                            queryKeys={["list", list._id]}
                            fetchData={(p) => fetchItems(list._id, p, filter)}
                        />
                        <div className="flex gap-3 sticky bottom-0">
                            <button type="button" className="secondary" onClick={() => setter({ isDeleting: false })}>Cancel</button>
                            <button type="submit" className="bigBtn bg-red-500">Delete</button>
                        </div>
                    </form>
                </section>
            </Modal>

            {/* Modal for adding items in the list */}
            <Modal open={modal} close={() => setter({ modal: false })}>
                <Search close={() => setter({ modal: false })} list_id={list._id} queryKeys={["list", list._id]} />
            </Modal>
        </>
    )
}

export default ListPage;