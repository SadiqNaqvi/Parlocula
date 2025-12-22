"use client";

import { AddIcon, EditIcon } from "@assets/Icons";
import { GenericWrapper, Navbar } from "@components";
import { SimpleUserBar } from "@components/ui/UserBar";
import { threadManagersLimit } from "@lib/constants";
import { getManagers } from "@lib/helpers/common";
import { useOptionalState } from "@lib/hooks";
import { getQueryKeys } from "@lib/utils";
import useCurrentUser from "@store/user";
import { ThreadModType } from "@type/internal";
import { TypedFunction } from "@type/other";
import { InviteManagers, RemoveManagers } from "./EditManagers";

type Props = {
    tid: string,
    uid: string
}

const ManagerNavbar = ({ managersCount, isCreator, onInvite, onRemove }: { managersCount: number, isCreator: boolean, onInvite: TypedFunction, onRemove: TypedFunction }) => (
    <Navbar
        navTitle="Manage Managers"
        OptionButton={
            <div className="flex gap-2">

                {managersCount < threadManagersLimit && (
                    <button onClick={onInvite}>
                        <AddIcon />
                    </button>
                )}

                {isCreator && (
                    <button onClick={onRemove}>
                        <EditIcon />
                    </button>
                )}

            </div>
        }
    />
)

const Component = (data: ThreadModType, { tid, uid }: Props) => {

    const [section, setSection] = useOptionalState<"show" | "invite" | "remove">("show");
    const threadCreator = data.creator.user_id;
    const managersCount = data.managers.length;
    const managers = data.managers.filter(u => u.role === "moderator");
    const invitees = data.managers.filter(u => u.role === "moderator_invitees");

    const handleBack = () => setSection("show");

    if (section === "invite") return (
        <InviteManagers back={handleBack} tid={tid} managersCount={managersCount} uid={uid} />
    )

    else if (section === "remove") return (
        <RemoveManagers back={handleBack} tid={tid} uid={uid} managers={data.managers} />
    )

    if (!managersCount) return (
        <>
            <ManagerNavbar
                isCreator={uid === threadCreator}
                onInvite={() => setSection("invite")}
                onRemove={() => setSection("remove")}
                managersCount={managersCount}
            />
            <div className="forceCenter">
                <p className="mt-32">No Managers has been chosen yet</p>
            </div>
        </>
    )

    return (
        <>
            <ManagerNavbar
                isCreator={uid === threadCreator}
                onInvite={() => setSection("invite")}
                onRemove={() => setSection("remove")}
                managersCount={managersCount}
            />

            <section className="space-y-4">

                <div className="space-y-2">
                    <h4 className="uppercase text-sm font-semibold">Managers</h4 >
                    {Boolean(managers.length) ?
                        (
                            <ul className="space-y-3">
                                {managers.map(u => (
                                    <li key={u.user_id}>
                                        <SimpleUserBar _id={u.user_id} username={u.username} profile={u.profile} />
                                    </li>
                                ))}
                            </ul>
                        )
                        :
                        (
                            <p className="text-center">No Managers Yet</p>
                        )
                    }
                </div>

                <div className="space-y-2">
                    <h4 className="uppercase text-sm font-semibold">Invitees</h4>
                    {Boolean(invitees.length) ?
                        (
                            <ul className="space-y-3">
                                {invitees.map(u => (
                                    <li key={u.user_id}>
                                        <SimpleUserBar _id={u.user_id} username={u.username} profile={u.profile} />
                                    </li>
                                ))}
                            </ul>
                        )
                        :
                        (
                            <p className="text-center">No Invitees Yet</p>
                        )
                    }
                </div>

            </section >

        </>
    )
}

const Managers = ({ tid }: { tid: string }) => {

    const { meta } = useCurrentUser();
    if (!meta) return null;

    return <GenericWrapper
        component={Component}
        getQueryProps={({ tid }) => ({
            args: [tid, meta.user_id],
            queryFn: getManagers,
            queryKeys: getQueryKeys("threadManagers_tid", { tid })
        })}
        props={{ tid, uid: meta.user_id }}
        needUser
    />

}

export default Managers;