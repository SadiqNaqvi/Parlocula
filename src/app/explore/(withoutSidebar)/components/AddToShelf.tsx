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
import { useEffect, useRef, useState } from "react";
import AddToCollaborativeShelf from "./AddToCollaborativeShelf";

const buttonClassName = "w-full py-2 flex flex-cntr-between";

type ShelfClickActions = "added" | "removed" | "none"

const AddToShelf = ({ className, cinement, released }: { className?: string, cinement: CinementSchemaType, released: boolean }) => {

    const { meta, user } = useCurrentUser();
    const sheetRef = useRef<BottomSheetRef>(null);

    const { data, isFetching, isError, isRefetching, refetch } = useQueryHook({
        queryFn: () => getShelvesForCinement(cinement.cinement_id, meta?.user_id || ""),
        queryKeys: getQueryKeys("shelfsForCinement_cnid", { cnid: cinement.cinement_id }),
        enabled: Boolean(meta)
    });

    const [shelfBucket, setShelfBucket] = useState<Map<string, ShelfClickActions>>(new Map());

    useEffect(() => {
        if (!data) return;
        setShelfBucket(new Map(data.shelves.map(id => [id, "none"])))
    }, [data])

    if (!meta || !user) return (
        <BottomSheet className={className} button="Add To Shelf">
            <LoginModal
                skipFullScreen
                desc={[
                    "Uh Oh! You have been stopped by the Parlocula Cops.",
                    "Looks like you are not logged in",
                    "Don't worry, we got you."
                ]}
            />
        </BottomSheet>
    );

    else if (isFetching && !isRefetching) return <LoadingButton />

    else if (isError || !data) return (
        <button className="secondary" onClick={() => refetch()}>Try Again</button>
    )

    const { shelves } = data;

    const shelfMap = new Map<string, boolean>(shelves.map(shelf_id => [shelf_id, true]));

    const handleToggle = (id: string) => {
        const tempBucket = new Map(shelfBucket);

        const isAlreadyChecked = Boolean(shelfMap.has(id));
        const currentCheckedStatus = tempBucket.get(id);
        const isUntouched = !currentCheckedStatus || currentCheckedStatus === "none";

        if (isAlreadyChecked && isUntouched) {
            tempBucket.set(id, "removed");
        } else if (isAlreadyChecked && currentCheckedStatus === "removed") {
            tempBucket.set(id, "none");
        } else if (!isAlreadyChecked && isUntouched) {
            tempBucket.set(id, "added");
        } else if (!isAlreadyChecked && currentCheckedStatus === "added") {
            tempBucket.set(id, "none");
        }

        setShelfBucket(tempBucket);
    }

    const ShelfSelectorBar = (props: MereShelf) => {
        const currentStatus = shelfBucket.get(props._id);
        return (
            <ShelfSelector
                {...props}
                onClick={handleToggle}
                checked={(shelfMap.has(props._id) && currentStatus !== "removed") || currentStatus === "added"}
                disabled={!released}
                className="px-0"
            />
        )
    }

    const submit = async () => {
        const add: string[] = [];
        const remove: string[] = [];

        if (!cinement.cinement_id)
            return "Cinement id is required"

        let shelfStatus: Record<PredefinedShelves, ShelfClickActions> = {
            favourite: "none", recommended: "none", watched: "none"
        };

        user.predefinedShelves.forEach(({ _id, name }) => {
            shelfStatus[name] = shelfBucket.get(_id) || "none";
        });

        shelfBucket.entries().forEach(([id, status]) => {
            if (status === "removed") remove.push(id);
            else if (status === "added") add.push(id);
        });

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

    return (
        <BottomSheet onClose={submit} ref={sheetRef} button="Add To Shelf" className={className}>
            <>

                <header className="px-2 sticky bottom-0 space-y-2 bg-primary w-full pb-4 border-b border-gray30">
                    <div onClick={submit}>
                        <NestedSheet
                            className={buttonClassName}
                            button={(
                                <>
                                    <span>Create New Shelf</span>
                                    <RightChevron />
                                </>
                            )}>
                            <ShelfForm cinements={[cinement]} />
                        </NestedSheet>
                    </div>
                    <NestedSheet
                        button={(
                            <>
                                <span>Add in Collaborative Shelves</span>
                                <RightChevron />
                            </>
                        )}
                        className={buttonClassName}>
                        <AddToCollaborativeShelf
                            cinement={{
                                id: cinement.cinement_id,
                                ext_id: cinement.ext_id,
                                type: cinement.cinement_type
                            }}
                            uid={meta.user_id} />
                    </NestedSheet>
                </header>

                <section className="px-2 space-y-1 my-4">
                    <h4 className="text-xs uppercase">For Others</h4>
                    <ul className="space-y-2">
                        {user.predefinedShelves.map(s => (
                            <li key={s._id}>
                                <ShelfSelectorBar {...s} />
                            </li>
                        ))}
                    </ul>
                </section>
                <section className="px-2 space-y-1 my-4">
                    <h4 className="text-xs uppercase">Your Shelves</h4>
                    <InfiniteScroller
                        Component={ShelfSelectorBar}
                        fetchData={(p) => getAllShelvesOfUser(meta.user_id, p)}
                        queryKeys={getQueryKeys("allShelvesOfUser_uid", { uid: meta.user_id })}
                        NotFoundSection={<></>}
                        className="space-y-2"
                    />
                </section>
            </>
        </BottomSheet>
    )

}

export default AddToShelf;