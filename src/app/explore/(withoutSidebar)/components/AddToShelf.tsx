"use client";

import { RightChevron } from "@assets/Icons";
import { BottomSheet, BottomSheetRef, InfiniteScroller, LoadingButton, NestedSheet } from "@components";
import { LoginModal } from "@components/fallbacks";
import { Form, ShelfForm, ShelfSelector } from "@components/form";
import { getAllShelvesOfUser, getShelvesForCinement } from "@lib/helpers/common";
import { updateShelvesWithItem } from "@lib/helpers/mutations";
import { useQueryHook } from "@lib/hooks";
import { getQueryKeys } from "@lib/utils";
import useCurrentUser from "@store/user";
import { MereShelf } from "@type/internal";
import { PredefinedShelves } from "@type/models";
import { CinementSchemaType } from "@type/schemas";
import { useRef } from "react";
import AddToCollaborativeShelf from "./AddToCollaborativeShelf";

const AddToShelf = ({ className, cinement, released }: { className?: string, cinement: CinementSchemaType, released: boolean }) => {

    const { meta, user } = useCurrentUser();
    const sheetRef = useRef<BottomSheetRef>(null);
    const formRef = useRef<HTMLFormElement>(null);
    // useEffect(() => console.log("meta in addToShelf", meta, user), [meta]);

    const { data, isFetching, isError, isRefetching, refetch } = useQueryHook({
        queryFn: () => getShelvesForCinement(cinement.cinement_id, meta?.user_id || ""),
        queryKeys: getQueryKeys("shelfsForCinement_cnid", { cnid: cinement.cinement_id }),
        enabled: Boolean(meta),
    });

    if (!meta || !user) return (
        <BottomSheet className={className} button="Add To Shelf">
            <LoginModal
                skipFullScreen
                heading="Uh oh! Looks like you are not logged in"
            />
        </BottomSheet>
    );

    else if (isFetching && !isRefetching) return <LoadingButton />

    else if (isError || !data) return (
        <button className="secondary" onClick={() => refetch()}>Try Again</button>
    )

    const { shelves } = data;

    const shelfMap = new Map<string, boolean>(shelves.map(shelf_id => [shelf_id, true]));

    const ShelfSelectorBar = (props: MereShelf) => (
        <ShelfSelector
            {...props}
            checked={shelfMap.get(props._id)}
            disabled={!released}
            className="px-2 sm:px-0"
        />
    )

    const submit = async (ids: Record<string, boolean>) => {
        const add: string[] = [];
        const remove: string[] = [];

        if (!cinement.cinement_id)
            return "Cinement id is required"

        let shelfStatus: Record<PredefinedShelves, "none" | "added" | "removed"> = {
            favourite: "none", recommended: "none", watched: "none"
        };

        user.predefinedShelves.forEach(({ _id, name }) => {

            if (ids[_id] === Boolean(shelfMap.get(_id))) return;
            else if (ids[_id]) shelfStatus[name] = "added";
            else shelfStatus[name] = "removed";
        });

        Object.entries(ids).forEach(([id, status]) => {
            if (Boolean(shelfMap.get(id)) === status) return;
            else if (status) add.push(id);
            else remove.push(id);
        });

        sheetRef.current?.close();

        if (add.length || remove.length || Object.entries(shelfStatus).some(([k, v]) => v !== "none")) {
            await updateShelvesWithItem(
                cinement.cinement_id,
                cinement.cinement_type,
                user._id,
                {
                    ext_id: cinement.ext_id,
                    year: cinement.year,
                    add,
                    remove,
                    ...shelfStatus
                },
            );
        }
    }

    const requestSubmit = () => formRef.current?.requestSubmit();

    return (
        <BottomSheet onClose={requestSubmit} ref={sheetRef} button="Add To Shelf" className={className}>
            <>
                {/* <div className="px-2 pb-4 border-b border-gray20 flex flex-cntr-between">
                    <span>Add to</span>
                </div> */}

                <NestedSheet
                    button={(
                        <>
                            <span>Add in Collaborative Shelves</span>
                            <RightChevron />
                        </>
                    )}
                    className="w-full px-2 sm:px-0 py-4 flex flex-cntr-between">
                    <AddToCollaborativeShelf
                        cinement={{
                            id: cinement.cinement_id,
                            ext_id: cinement.ext_id,
                            type: cinement.cinement_type
                        }}
                        uid={meta.user_id} />
                </NestedSheet>

                <Form submit={submit} skipReset hideLoading>
                    <section className="space-y-1 my-4">
                        <h4 className="text-xs uppercase">For Others</h4>
                        <ul className="space-y-2">
                            {user.predefinedShelves.map(s => (
                                <li key={s._id}>
                                    <ShelfSelectorBar {...s} />
                                </li>
                            ))}
                        </ul>
                    </section>
                    <section className="space-y-1 my-4">
                        <h4 className="text-xs uppercase">Your Shelves</h4>
                        <InfiniteScroller
                            Component={ShelfSelectorBar}
                            fetchData={(p) => getAllShelvesOfUser(meta.user_id, p)}
                            queryKeys={getQueryKeys("allShelvesOfUser_uid", { uid: meta.user_id })}
                            NotFoundSection={<></>}
                        />
                    </section>
                </Form>
                <footer onClick={() => console.log("new pr click hua")} className="sticky bottom-0 bg-primary w-full">
                    <NestedSheet
                        className="w-full px-2 sm:px-0 py-4 flex flex-cntr-between"
                        button={(
                            <>
                                <span>Create New Shelf</span>
                                <RightChevron />
                            </>
                        )}>
                        <ShelfForm cinements={[cinement]} />
                    </NestedSheet>
                </footer>
            </>
        </BottomSheet>
    )

}

export default AddToShelf;