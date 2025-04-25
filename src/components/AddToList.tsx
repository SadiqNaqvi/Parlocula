"use client";

import { BookmarkIcon, CheckIcon } from "@assets/Icons";
import { ppGetData } from "@lib/helpers/common";
import { predefinedUserLists } from "@lib/constants";
import { useCustomReducer, useQueryHook } from "@lib/hooks";
import useCurrentUser from "@store/user";
import { ListForm, Modal, Navigate } from "./";
import { LoadingSpinner } from "./ui";
import OptionList from "./ui/OptionList"
import { InputMediaType } from "@type/internal";
import { updatingListsWithItem } from "@lib/helpers/client";
import { CheckTile } from "./form";

const queryFn = async (id: string) => {
    const { success, errCode, result } = await ppGetData({ url: `/private/media/${id}`, options: null, revalidate: 100 })
    if (!success) throw new Error(errCode);
    return result;
}

const Component = ({ isError, isFetching, isUser, retry }: { isFetching: boolean, isError: boolean, isUser: boolean, retry: () => void }) => {
    if (!isUser) return (
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

const AddToList = ({ className, media }: { className?: string, media: InputMediaType & { media_id: string } }) => {

    const { user } = useCurrentUser();

    const { data, isFetching, isError, refetch } = useQueryHook({
        queryFn: () => queryFn(media.media_id),
        queryKeys: [`lists-for-media-${media.media_id}`],
        enabled: Boolean(user),
    })

    const { listMap, isCreating, listsBox, newLists, setter } = useCustomReducer<{
        listMap: Map<string, boolean>, isCreating: boolean, listsBox: boolean, newLists: string[]
    }>({
        listMap: new Map<string, boolean>(data?.map((el: { list_id: string }) => [el.list_id, true])),
        isCreating: false,
        listsBox: false,
        newLists: []
    });

    const lists = predefinedUserLists
        .map(l => ({ title: l, list_id: l }))
        .concat(user?.lists ?? []);

    const callBack = async (e: any) => {
        e.stopPropagation();
        e.preventDefault();
        const result = lists.map(({ list_id }) => ({ id: list_id, status: e.target[list_id].checked }));
        const add: any[] = [];
        const remove: any[] = [];
        result.forEach(({ id, status }) => {
            const oldStatus = listMap.get(id);
            const newStatus = status;
            if (newStatus === oldStatus) return;
            if (newStatus) add.push(id);
            else remove.push(id);
        })

        setter({ listMap: new Map(result.map(({ id, status }) => [id, status])), listsBox: false });
        // await updatingListsWithItem(media.media_id, { tmdb_id: media.tmdb_id, year: media.year, add, remove })
    }

    const getNewList = (list: { name: string, isPrivate: boolean, }) => {
        setter({ newLists: [...newLists, list.name], isCreating: false });
    }

    return (
        <>
            <button className={className} onClick={() => setter({ listsBox: true })}>
                <BookmarkIcon /> Add To List
            </button>

            <section className={`${listsBox ? "fixed inset-0 flex" : "hidden"} flex-cntr-all backdrop-brightness-[25%]`} onClick={() => setter({ listsBox: false })}>
                <div className="py-4 bg-primary border border-gray30 rounded-md w-[500px] max-h-[80%] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    {/* {isFetching || isError || !user ?
                        <Component isError={isError} isFetching={isFetching} isUser={Boolean(user)} retry={refetch} />
                        : */}
                    <>
                        <div className="px-4 py-2 border-b border-gray30">
                            <span>Add to:</span>
                        </div>
                        <form onSubmit={callBack}>
                            {lists.map(({ list_id, title }) => (
                                <CheckTile name={list_id} lable={title} />
                            ))}
                            {newLists.map(name => (
                                <CheckTile name={name} lable={name} checked disable />
                            ))}
                            <button className="py-2 w-full border-b border-gray30 text-center sticky bottom-0 bg-primary">Save</button>
                        </form>
                        <p className="my-2 text-center">or</p>
                        <OptionList onClick={() => setter({ isCreating: true })}>Create New List</OptionList>
                    </>
                    {/* } */}
                </div>
            </section>
            <Modal open={isCreating} close={() => setter({ isCreating: false })}>
                <ListForm callback={getNewList} medias={[media]} />
            </Modal>
        </>
    )

}

export default AddToList;