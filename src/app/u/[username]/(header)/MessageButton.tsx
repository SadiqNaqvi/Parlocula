"use client";

import NewRoom from "@app/inbox/new/[ruid]/NewRoom";
import { Navigate } from "@components";
import BottomSheetTrigger from "@components/BottomSheet";
import { getRoomByUserId } from "@lib/helpers/common";
import { useQueryHook } from "@lib/hooks";
import { getQueryKeys } from "@lib/utils";
import useCurrentUser from "@store/user";

const MessageButton = ({ ruid, username, profile }: { ruid: string, username: string, profile: string | undefined }) => {

    const { meta } = useCurrentUser();

    const { data, isError, isPending } = useQueryHook<{ _id: string }>({
        queryKeys: meta ? getQueryKeys("roomExists_ruid_uid", { ruid, uid: meta.user_id }) : [],
        queryFn: () => getRoomByUserId((meta?.user_id as string), ruid),
        enabled: Boolean(meta),
    });

    if (isError || isPending || !meta) return null;

    if (data) return (
        <Navigate goto={`/inbox/${data._id}`}
            comp="link"
            className="btn secondary flex-1 sm:w-fit"
        >
            Message
        </Navigate>
    )

    return (
        <BottomSheetTrigger button="Message" className="btn secondary flex-1 sm:w-fit">
            <NewRoom ruser={{ _id: ruid, username, profile }} user={meta} />
        </BottomSheetTrigger>
    )
}

export default MessageButton;