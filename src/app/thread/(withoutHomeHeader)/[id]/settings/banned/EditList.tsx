
import { CheckIcon } from "@assets/Icons";
import { ListSelector, ListSelectorRef, Navbar } from "@components";
import { blockOrBanLimit } from "@lib/constants";
import { searchBannedMembers, searchMembers } from "@lib/helpers/common";
import { banMembersMutation, unbanMembersMutation } from "@lib/helpers/mutations";
import { getQueryKeys } from "@lib/utils";
import { MereUser } from "@type/internal";
import { TypedFunction } from "@type/other";
import { useRef } from "react";

export const UnbanAction = ({ tid, uid }: { tid: string, uid: string, back: TypedFunction }) => {

    const callbackRef = useRef<ListSelectorRef>(null);

    const handleUnBan = () => {
        const users = callbackRef.current?.();
        if (!users || !users.length) return;
        unbanMembersMutation(tid, uid, { users });
    }

    return (
        <>
            <Navbar
                navTitle="Select to Unban"
                OptionButton={
                    <button onClick={handleUnBan}><CheckIcon /></button>
                }
            />
            <ListSelector
                mode="search"
                callbackRef={callbackRef}
                limit={blockOrBanLimit}
                queryFn={(q, p) => searchBannedMembers(tid, uid, q, p)}
                queryKeys={(query) => getQueryKeys("searchBannedMembers_tid_query", { tid, query })}
                refiner={(user) => ({
                    id: user._id,
                    title: user.username,
                    poster: user.profile,
                })}
                inputPlaceholder="Search banned users to unban"
            />
        </>
    )

}

export const BanAction = ({ tid, uid }: { tid: string, uid: string, back: TypedFunction }) => {

    const callbackRef = useRef<ListSelectorRef<MereUser>>(null);

    const handleBan = () => {
        const users = callbackRef.current?.();
        if (!users || !users.length) return;
        banMembersMutation(tid, uid, users);
    }

    return (
        <>
            <Navbar navTitle="Select to Unban"
                OptionButton={
                    <button onClick={handleBan}><CheckIcon /></button>
                }
            />
            <ListSelector
                mode="search"
                callbackRef={callbackRef}
                limit={blockOrBanLimit}
                queryFn={(q, p) => searchMembers(tid, q, p)}
                queryKeys={(query) => getQueryKeys("searchMembers_tid_query", { tid, query })}
                refiner={(user) => ({
                    id: user._id,
                    title: user.username,
                    poster: user.profile,
                    returnVal: user
                })}
                inputPlaceholder="Search members to ban"
            />
        </>
    )

}