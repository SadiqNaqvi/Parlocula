"use client";

import { RightChevron } from "@assets/Icons";
import { InfiniteScroller } from "@components";
import BottomSheet, { NestedSheet } from "@components/BottomSheet";
import { CheckTile, Form } from "@components/form";
import ShelfForm from "@components/form/ShelfForm";
import { LoadingButton } from "@components/UserBasedButton";
import { getShelvesForCinement, getShelvesOfUser } from "@lib/helpers/common";
import { updateShelvesWithItem } from "@lib/helpers/mutations";
import { useQueryHook } from "@lib/hooks";
import { getQueryKeys } from "@lib/utils";
import useCurrentUser from "@store/user";
import { PredefinedShelves } from "@type/models";
import { CinementSchemaType } from "@type/schemas";
import AddToCollaborativeShelf from "./AddToCollaborativeShelf";
import { LoginModal } from "@components/fallbacks";

const AddToShelf = ({ className, cinement, released }: { className?: string, cinement: CinementSchemaType, released: boolean }) => {

    const { meta, user } = useCurrentUser();

    const { data, isFetching, isError, isRefetching, refetch } = useQueryHook({
        queryFn: () => getShelvesForCinement(cinement.cinement_id, meta?.user_id || ""),
        queryKeys: getQueryKeys("shelfsForCinement_cnid", { cnid: cinement.cinement_id }),
        enabled: Boolean(meta),
    });

    if (!meta || !user) return (
        <BottomSheet className={className} button="Add To Shelf">
            <LoginModal
                skipFullScreen
                title="Uh oh! Looks like you are not logged in"
            />
        </BottomSheet>
    );

    else if (isFetching && !isRefetching) return <LoadingButton />
    else if (isError || !data)
        return <button className="secondary" onClick={() => refetch()}>Try Again</button>

    const { shelves } = data;

    const shelfMap = new Map<string, boolean>(shelves.map(shelf_id => [shelf_id, true]))

    const predefinedShelves = user.predefinedShelves
        .filter(s => (s.name !== "watched" || released));

    const ShelfCheckTile = ({ _id, name }: { name: string, _id: string }) => {
        return (
            <div className="border-b border-gray30">
                <CheckTile type="checkbox" label={name} name={_id} checked={shelfMap.get(_id)} />
            </div>
        )
    }

    const submit = async (ids: Record<string, boolean>) => {
        const add: string[] = [];
        const remove: string[] = [];

        if (!cinement.cinement_id)
            return "Cinement id is required"

        let shelfStatus: Record<PredefinedShelves, "none" | "added" | "removed"> = {
            favourite: "none", recommended: "none", watched: "none"
        };

        predefinedShelves.forEach(({ _id, name }) => {
            if (ids[_id] === shelfMap.get(_id)) return;
            else if (ids[_id]) shelfStatus[name] = "added";
            else shelfStatus[name] = "removed";
        });

        Object.entries(ids).forEach(([id, status]) => {
            if (shelfMap.get(id) === status) return;
            else if (status) add.push(id);
            else remove.push(id);
        });

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

    return (
        <>
            <BottomSheet button="Add To Shelf" className={className}>
                <div className="p-4 bg-primary border border-gray30 rounded-md w-[500px] max-h-[80%] overflow-y-auto">

                    <div className="my-4 border-b border-gray30 flex flex-cntr-between">
                        <span>Add to</span>
                        <NestedSheet className="text-sm" button="Create new shelf">
                            <ShelfForm cinements={[cinement]} />
                        </NestedSheet>
                    </div>

                    <NestedSheet
                        button={
                            <>
                                <span>Add in Collaborative Shelves</span>
                                <RightChevron />
                            </>
                        }
                        className="p-2 m-2 border borde-gray40 rounded-md flex flex-cntr-between">
                        <AddToCollaborativeShelf
                            cinement={{
                                id: cinement.cinement_id,
                                ext_id: cinement.ext_id,
                                type: cinement.cinement_type
                            }}
                            uid={meta.user_id} />
                    </NestedSheet>

                    <Form submit={submit}>

                        <ul>
                            {
                                predefinedShelves.map(s => (
                                    <ShelfCheckTile key={s._id} _id={s._id} name={s.name} />
                                ))
                            }
                        </ul>

                        <InfiniteScroller
                            Component={ShelfCheckTile}
                            fetchData={(p) => getShelvesOfUser(user.username, p)}
                            queryKeys={getQueryKeys("shelvesOfUser_uid_filter", { uid: meta.user_id, filter: "latest" })}
                        />

                        <footer className="fixed bottom-0 p-3 bg-primarylight">
                            <button className="w-full primary">Save</button>
                        </footer>

                    </Form>
                </div>
            </BottomSheet>
        </>
    )

}

export default AddToShelf;