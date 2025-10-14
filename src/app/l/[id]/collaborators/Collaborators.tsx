"use client";

import { GenericWrapper, Navbar } from "@components";
import { CheckTile, Form } from "@components/form";
import { listCollaboratorsLimit } from "@lib/constants";
import { removeCollaborators } from "@lib/helpers/client";
import { getCollaboratorsOfList } from "@lib/helpers/common";
import { mutationWrapper } from "@lib/mutation";
import { getQueryClient } from "@lib/queryClient";
import { getPoster, getQueryKeys } from "@lib/utils";
import { useMutation } from "@tanstack/react-query";
import { ListCollaborators, MereUser } from "@type/internal";
import Image from "next/image";
import { useState } from "react";
import InviteButton from "./Invite";

type Props = { lid: string, uid: string, name: string }

const UserTile = ({ _id, username, profile }: MereUser) => (
    <li key={_id} className="flex gap-4">
        <Image
            className="size-[50px] object-cover"
            height={50}
            width={50}
            alt={`Profile picture of ${username}`}
            src={getPoster({ path: profile })} />
        <h5 className="line-clamp-1">{username}</h5>
    </li>
)

const Collaborators = ({ lid, uid, name }: Props) => {

    const [isRemoving, setIsRemoving] = useState(false);
    const queryClient = getQueryClient();

    const removeMutation = useMutation(
        mutationWrapper({
            mutationFn: async (users: string[]) => await removeCollaborators({ users }, lid, uid),
            optimisticWork: (data, qKeys) => {
                const map = new Map(data.map(el => [el, true]));
                const previousState = queryClient.getQueryData(qKeys);
                queryClient.setQueryData(qKeys, (old: ListCollaborators) => {
                    return {
                        ...old,
                        collaborators: old.collaborators.filter(u => !map.get(u._id)),
                        invitees: old.invitees.filter(u => !map.get(u._id)),
                    }
                });
                return { previousState }
            },
            queryClient,
            queryKeys: getQueryKeys("listCollaborators_lid", { lid }),
        })
    );

    const handleRemoval = (data: string[]) => {
        removeMutation.mutate(data)
    }

    const component = (data: ListCollaborators) => {

        const total = data.collaborators.concat(data.invitees);

        if (isRemoving) return (
            <>
                <Navbar navTitle="Manage Collaborators" />
                <section>
                    <Form submit={console.log}>
                        {total.map(u => (
                            <CheckTile label={u.username} poster={u.profile} name={JSON.stringify(u)} type="checkbox" />
                        ))}
                        <button className="mt-4 primary">Remove</button>
                    </Form>
                </section>
            </>
        )

        else if (total.length) return (
            <>
                <Navbar navTitle="Manage Collaborators" />
                <section className="space-y-4">
                    <div>
                        <h4 className="text-sm uppercase">Collaborators</h4>
                        <ul className="space-y-4">
                            {data.collaborators.map(c => (
                                <UserTile {...c} key={c._id} />
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm uppercase">Invitees</h4>
                        <ul className="space-y-4">
                            {data.invitees.map(c => (
                                <UserTile {...c} key={c._id} />
                            ))}
                        </ul>
                    </div>
                    <div className="flex gap-2">
                        <InviteButton lid={lid} limit={listCollaboratorsLimit - total.length} name={name} uid={uid} />
                        <button className="secondary" onClick={() => setIsRemoving(true)}>Remove</button>
                    </div>
                </section>
            </>
        )

        else return (
            <>
                <Navbar navTitle="Manage Collaborators" />
                <section className="mt-32">
                    <h3 className="w-full text-center">No collaborators</h3>
                    <button className="primary w-full sm:w-fit">Invite</button>
                </section>
            </>
        )
    }

    return <GenericWrapper
        component={component}
        getQueryProps={() => ({
            args: [uid, lid],
            queryFn: getCollaboratorsOfList,
            queryKeys: getQueryKeys("listCollaborators_lid", { lid })
        })}
        props={{ lid, uid }}
    />
}

export default Collaborators;