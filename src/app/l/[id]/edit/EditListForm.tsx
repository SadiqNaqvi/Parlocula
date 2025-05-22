"use client";

import { LeftChevron } from "@assets/Icons";
import { DynamicComponent, InfiniteScroller, Navigate } from "@components";
import { CheckTile, Form, Input, ToggleButton } from "@components/form";
import { LoadingSpinner, NotFound, ShowError } from "@components/ui";
import { getPoster } from "@lib/dataRefiner";
import { updateList } from "@lib/helpers/client";
import { getItems, getList } from "@lib/helpers/common";
import { filterItemsMutation, updateMutation } from "@lib/mutation";
import { getQueryKeys, queryFunction } from "@lib/utils";
import useCurrentUser from "@store/user";
import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { FullList, ListItemType, User } from "@type/internal";
import { ListEditSchema } from "@type/schemas";
import { useRouter } from "next/navigation";

type PageProps = { lid: string };

type Hooks = {
    currentUser: { user: User | null, isHydrated: boolean },
    mutation: UseMutationResult<any, any, ListEditSchema, any>,
}

const ItemCheckTile = ({ _id, title, poster }: ListItemType) => (
    <CheckTile type="checkbox" label={title} name={_id} poster={getPoster("poster", poster, 1)} />
)

const component = (data: FullList, _: any, { currentUser, mutation }: Hooks) => {

    const { _id } = data;

    const { user, isHydrated } = currentUser;

    if (!isHydrated) return <LoadingSpinner />

    else if (!user)
        return <ShowError heading="You're not allowed to edit this list." errCode="pp201" />

    else if (user._id !== data.user_id)
        return <NotFound title="You're not allowed to edit this list." paras={[""]} />

    const submit = (data: any) => {

        const { name, isPrivate, ...items } = data;

        const thingsToUpdate = Object({
            ...(name !== data.name && { name }),
            ...(isPrivate !== data.isPrivate && { isPrivate }),
            itemsToDelete: Object.entries(items)
                .reduce((total, [key, value]) => {
                    if (value) return [...total, key];
                    return total;
                }, [] as string[]),
        });
        if (Object.keys(thingsToUpdate).length)
            mutation.mutate(thingsToUpdate);
    }

    return (
        <>
            <Form submit={submit}>
                <nav className="flex py-3 w-full flex-cntr-between">
                    <Navigate goto="back" comp="button">
                        <LeftChevron />
                    </Navigate>
                    <h1>Edit List</h1>
                    <button type="submit" className="primary">Update</button>
                </nav>
                <header className="space-y-4 mb-6">
                    <Input
                        name="name"
                        label="Name"
                        placeholder="Eg: Horror movies to watch"
                        required
                        defaultValue={data.name}
                    />
                    <ToggleButton
                        name="isPrivate"
                        label="Private"
                        checked={data.isPrivate}
                    />
                </header>
                <section>
                    <h2 className="text-lg mb-4">Select items to delete:</h2>
                    <InfiniteScroller
                        Component={ItemCheckTile}
                        queryKeys={getQueryKeys("itemsOfList_lid_filter_page", { lid: _id, filter: "latest", page: 1 })}
                        fetchData={(p) => queryFunction(getItems, [_id, p, "latest"])}
                    />
                </section>
            </Form>
        </>
    )

}

const ListEditPage = ({ lid }: PageProps) => {

    const queryClient = useQueryClient();
    const currentUser = useCurrentUser();
    const router = useRouter();

    const keysForList = getQueryKeys("list_lid", { lid: lid });
    const keysForItems = getQueryKeys("itemsOfList_lid_filter_page", { lid: lid, filter: "latest", page: 1 });

    const mutationFn = async (data: ListEditSchema) => {
        const uid = currentUser.user?._id;
        if (!uid) throw new Error();
        const success = await updateList(lid, data, uid, router);
        if (success === false) throw new Error();
    }

    const dynamicComponent = DynamicComponent({
        component,

        getQueryProps: ({ id }) => ({
            queryKeys: getQueryKeys("list_lid", { id }),
            queryFn: getList,
            args: [id],
        }),

        getHooks: () => ({
            currentUser,
            mutation: useMutation({
                mutationFn,
                onMutate: async (data: ListEditSchema) => {
                    const { itemsToDelete, ...rest } = data;

                    let prevListState: any = null, prevItemsState: any = null;

                    if (Object.keys(rest).length)
                        prevListState = await updateMutation(rest, keysForList, queryClient);

                    if (itemsToDelete && itemsToDelete.length)
                        prevItemsState = await filterItemsMutation(itemsToDelete, keysForItems, queryClient);

                    return { prevItemsState, prevListState }
                },
                onSuccess: () => queryClient.refetchQueries({
                    queryKey: getQueryKeys("listsOfUser_username_filter", { username: currentUser.user?.username, filter: "latest" })
                }),
                onError: (e, v, c) => {
                    queryClient.setQueryData(keysForList, c?.prevListState)
                    queryClient.setQueryData(keysForItems, c?.prevItemsState)
                }
            }),
        }),
    });

    return dynamicComponent({ id: lid })
}

export default ListEditPage;