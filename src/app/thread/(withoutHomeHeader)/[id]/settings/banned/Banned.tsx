"use client"

import { AddIcon } from "@assets/Icons";
import { InfiniteScroller, Navbar } from "@components";
import UserBar from "@components/ui/UserBar";
import { getBannedMembers } from "@lib/helpers/common";
import { useQueryHook } from "@lib/hooks";
import { getQueryKeys } from "@lib/utils";
import { TypedFunction } from "@type/other";
import { useState } from "react";
import { BanAction, UnbanAction } from "./EditList";

const nfm = {
    title: "No banned users",
    paras: ["Click the plus icon to ban users"]
}

const OptionButtons = ({ onAdd, onRemove, tid, uid }: { onRemove: TypedFunction, onAdd: TypedFunction, tid: string, uid: string }) => {
    const { data } = useQueryHook({
        queryFn: () => getBannedMembers(tid, uid, 1),
        queryKeys: getQueryKeys("bannedMembers_tid", { tid })
    });

    if (!data || !data.total) return;

    else if (data.total) return (
        <div className="flex gap-2">
            <button onClick={onRemove} className="p-1">
                Remove
            </button>
            <button onClick={onAdd} className="p-1">
                <AddIcon />
            </button>
        </div>
    )

    return (
        <button onClick={onAdd} className="p-1">
            <AddIcon />
        </button>
    )

}

const BannedList = ({ tid, uid }: { tid: string, uid: string }) => {

    const [section, setSection] = useState<"list" | "removing" | "adding">("list");

    const handleBack = () => setSection("list");
    const handleAdd = () => setSection("adding");
    const handleRemove = () => setSection("removing");

    if (section === "removing") return (
        <UnbanAction
            back={handleBack}
            tid={tid}
            uid={uid}
        />
    )

    else if (section === "adding") return (
        <BanAction
            back={handleBack}
            tid={tid}
            uid={uid}
        />
    )

    return (
        <>
            <Navbar
                navTitle="Banned Members"
                OptionButton={
                    <OptionButtons
                        onAdd={handleAdd}
                        onRemove={handleRemove}
                        tid={tid}
                        uid={uid}
                    />
                }
            />
            <InfiniteScroller
                Component={UserBar}
                fetchData={(p) => getBannedMembers(tid, uid, p)}
                queryKeys={getQueryKeys("bannedMembers_tid", { tid })}
                notFoundMessage={nfm}
            />
        </>
    )
}
export default BannedList;