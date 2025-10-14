"use client";

import { AddIcon, CheckIcon, EditIcon } from "@assets/Icons";
import { GenericWrapper, Navbar } from "@components";
import { Form } from "@components/form";
import CheckTile from "@components/form/CheckAndRadioTile";
import { ActionSearchContainer } from "@components/SearchContainer";
import UserTile from "@components/ui/UserTile";
import { threadManagersLimit } from "@lib/constants";
import { getManagers, searchMembers } from "@lib/helpers/common";
import { useOptionalState } from "@lib/hooks";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys } from "@lib/utils";
import useCurrentUser from "@store/user";
import { MereUser, Thread, ThreadModType } from "@type/internal";
import { useRef } from "react";

type Props = {
    tid: string,
    creator: string,
    uid: string
}

const sanitizer = ({ _id, username, profile }: MereUser) => ({
    label: username,
    data: _id,
    poster: profile,
})

const component = (data: ThreadModType[], { creator, tid, uid }: Props) => {

    const [isRemoving, setIsRemoving] = useOptionalState(false);
    const formRef = useRef<HTMLFormElement>(null);

    if (creator === uid && isRemoving)
        return (
            <>
                <Navbar OptionButton={
                    <button onClick={() => formRef.current?.requestSubmit()}><CheckIcon /></button>
                } />
                <section>
                    <Form submit={console.log} ref={formRef}>
                        {data.map(v => (
                            <CheckTile label={v.username} name={v.user_id} type="checkbox" key={v._id} poster={v.profile} />
                        ))}
                    </Form>
                </section>
            </>
        )

    return (
        <>
            <Navbar
                OptionButton={
                    <div className="flex gap2">
                        {data.length < threadManagersLimit && (
                            <ActionSearchContainer
                                actionButton="Invite"
                                placeholder="Search members to invite"
                                action={console.log}
                                queryFn={(q, p) => searchMembers(tid, q, p)}
                                queryKeys={q => getQueryKeys("searchMembers_tid_query", { tid, query: q })}
                                sanitize={sanitizer}
                                limit={threadManagersLimit - data.length}
                            >
                                <AddIcon />
                            </ActionSearchContainer>
                        )}

                        {creator === uid && (
                            <button onClick={() => setIsRemoving(true)}><EditIcon /></button>
                        )}
                    </div>
                }
            />
            {data.length === 0 ? (
                <p className="mt-32">No Managers has been chosen yet</p>
            ) : (
                <section className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="uppercase text-sm font-semibold">Managers</h4>
                        <ul className="space-y-3">
                            {data.filter(u => u.role === "moderator").map(u => (
                                <li key={u.user_id}>
                                    <UserTile username={u.username} profile={u.profile} />
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <h4 className="uppercase text-sm font-semibold">Invitees</h4>
                        <ul className="space-y-3">
                            {data.filter(u => u.role === "moderator_invitees").map(u => (
                                <li key={u.user_id}>
                                    <UserTile username={u.username} profile={u.profile} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}
        </>
    )
}

const Managers = ({ tid }: { tid: string }) => {

    const { user } = useCurrentUser();
    const queryClient = getQueryClient();
    const creator = queryClient.getQueryData<Thread>(getQueryKeys("thread_id", { id: tid }))?.created_by;

    if (!user || !creator) return null;

    return <GenericWrapper
        component={component}
        getQueryProps={({ tid }) => ({
            args: [tid, user._id],
            queryFn: getManagers,
            queryKeys: getQueryKeys("threadManagers_tid", { tid })
        })}
        props={{ tid, creator, uid: user._id }}
        needUser
    />

}

export default Managers;