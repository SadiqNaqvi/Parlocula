"use client";

import { queryLimit } from "@lib/constants";
import { updatingListsWithItem } from "@lib/helpers/client";
import { getListsForMedia, getListsOfUser } from "@lib/helpers/common";
import { useQueryHook } from "@lib/hooks";
import { getQueryKeys, queryFunction } from "@lib/utils";
import useCurrentUser from "@store/user";
import { InputMediaType } from "@type/schemas";
import { InfiniteScroller, ListForm, Modal, Navigate } from "@components";
import { CheckTile, Form } from "@components/form";
import { CloseAndTrigger, Popover } from "@components/Modal";
import { LoadingSpinner } from "@components/ui";

type Props = {
    isFetching: boolean,
    isError: boolean,
    isUser: boolean,
    isHydrated: boolean,
    retry: () => void,
}
const Component = ({ isError, isFetching, isUser, retry, isHydrated }: Props) => {

    if (!isHydrated) return <LoadingSpinner />
    else if (!isUser) return (
        <div className="w-full h-[500px] flex flex-cntr-all">
            <p>You need to log in to do this!</p>
            <Navigate className="bg-secondary px-4 py-2 rounded-md" comp="link" goto="/join">Log-in</Navigate>
        </div>
    )

    else if (isFetching) return (
        <div className="w-full h-[500px] flex flex-cntr-all">
            <LoadingSpinner />
        </div>
    )
    else if (isError) return (
        <div className="w-full h-[500px] flex flex-cntr-all">
            <p>Something went wrong! Please try again.</p>
            <button className="primary" onClick={() => retry()}>Try again</button>
        </div>
    )
}

const AddToList = ({ className, media, released }: { className?: string, media: InputMediaType & { media_id: string }, released: boolean }) => {

    const { user, isHydrated, lists } = useCurrentUser();

    const { data, isFetching, isError, refetch } = useQueryHook({
        queryFn: () => queryFunction(getListsForMedia, [media.media_id, user?._id]),
        queryKeys: [`lists-for-media-${media.media_id}`],
        enabled: Boolean(user && isHydrated),
    });

    if (isFetching || isError || !isHydrated || !user) return (
        <Modal buttonChildren="Add To List" className={className} id="fallback-popover">
            <Component isError={isError} isHydrated={isHydrated} isFetching={isFetching} isUser={Boolean(user)} retry={refetch} />
        </Modal>
    )

    const listMap = new Map<string, boolean>(data?.map((el: { list_id: string }) => [el.list_id, true]))

    const ListCheckTile = ({ _id, name }: { name: string, _id: string }) => {
        return (
            <div className="border-b border-gray30">
                <CheckTile type="checkbox" label={name} name={_id} checked={listMap.get(_id)} />
            </div>
        )
    }

    const totalLists: { name: string, [key: string]: any }[] = [
        ...(user.predefine_lists.filter(l => !released && l.name === "watched" ? false : true)), ...lists
    ];

    const submit = async (ids: Record<string, boolean>) => {
        const add: string[] = [];
        const remove: string[] = [];
        let listStatus: Record<"favourite" | "watched" | "recommended", "none" | "added" | "removed"> = {
            favourite: "none", recommended: "none", watched: "none"
        };

        user.predefine_lists.forEach(({ _id, name }) => {
            if (ids[_id] === listMap.get(_id)) return;
            else if (ids[_id]) listStatus[name] = "added";
            else listStatus[name] = "removed";
        })

        Object.entries(ids).forEach(([id, status]) => {
            if (listMap.get(id) === status) return;
            else if (status) add.push(id);
            else remove.push(id);
        });

        await updatingListsWithItem(media.media_id, { tmdb_id: media.tmdb_id, year: media.year, add, remove, ...listStatus }, user._id);
    }

    return (
        <>
            <Modal id="addToList-popover" buttonChildren="Add To List" className={className}>
                <div className="p-4 bg-primary border border-gray30 rounded-md w-[500px] max-h-[80%] overflow-y-auto">
                    <div className="my-4 border-b border-gray30 flex flex-cntr-between">
                        <span>Add to</span>
                        <CloseAndTrigger id="create-list-popover" className="text-sm">Create new list</CloseAndTrigger>
                    </div>

                    <Form submit={submit}>
                        <InfiniteScroller
                            Component={ListCheckTile}
                            fetchData={(p) => queryFunction(getListsOfUser, [user.username, p, "latest"])}
                            queryKeys={getQueryKeys("listsOfUser_username_filter", { username: user.username, filter: "latest" })}
                            initialData={{ data: totalLists, total: totalLists.length > queryLimit ? (totalLists.length + 10) : queryLimit }}
                            initialPage={2}
                        />

                        <button className="w-full primary">Save</button>
                    </Form>
                </div>
            </Modal>
            <Popover id="create-list-popover">
                <ListForm medias={[media]} />
            </Popover>
        </>
    )

}

export default AddToList;