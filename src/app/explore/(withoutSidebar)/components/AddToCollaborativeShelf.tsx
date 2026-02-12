"use client"

import { GeneralTile, InfiniteScroller } from "@components";
import { getShelvesAsCollaborator } from "@lib/helpers/common";
import { addItemInCollaborativeShelf } from "@lib/helpers/mutations";
import { getQueryKeys } from "@lib/utils";
import { MereShelf } from "@type/internal";

const AddToCollaborativeShelf = ({ uid, taleon }: { uid: string, taleon: { id: string; type: "movie" | "show"; ext_id: string } }) => {

    const handleAdding = async (sid: string, isPrivate: boolean, shelfKey: string | undefined) => {
        await addItemInCollaborativeShelf(sid, uid, taleon, isPrivate, shelfKey);
    }

    const Component = ({ _id, name, poster, isPrivate, shelfKey }: MereShelf) => {
        return <GeneralTile title={name} poster={poster} onClick={() => handleAdding(_id, isPrivate, shelfKey)} />
    }

    return (
        <section className="py-4">
            <InfiniteScroller
                fetchData={(p) => getShelvesAsCollaborator(uid, p)}
                Component={Component}
                queryKeys={getQueryKeys("collaboratedShelvesOfUser_uid", { uid })}
            />
        </section>
    )

}

export default AddToCollaborativeShelf;