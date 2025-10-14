"use client"

import { Modal } from "@components";
import { CheckTile, Form } from "@components/form";
import SearchContainer from "@components/SearchContainer";
import { inviteCollaborators } from "@lib/helpers/client";
import { searchFollowers } from "@lib/helpers/common";
import { mutationWrapper } from "@lib/mutation";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { useMutation } from "@tanstack/react-query";
import { ListCollaborators, MereUser } from "@type/internal";
import { PropsWithChildren } from "react";

const UserCheckTile = ({ _id, username, profile }: MereUser) => {
    return <CheckTile label={username} name={JSON.stringify({ _id, username, profile })} type="checkbox" />
}

const InviteButton = ({ limit, uid, lid, name }: { limit: number, uid: string, lid: string, name: string }) => {

    // const inviteMutation = useMutation(mutationWrapper({
    //     mutationFn: async (d: MereUser[]) => await inviteCollaborators({ users: d.map(u => u._id), list_name: name }, lid, uid),
    //     optimisticWork: (data, qKeys, queryClient) => {
    //         const map = new Map(data.map(el => [el, true]));
    //         const previousState = queryClient.getQueryData(qKeys);
    //         queryClient.setQueryData(qKeys, (old: ListCollaborators) => {
    //             return {
    //                 ...old,
    //                 invitees: [...old.invitees, ...data],
    //             }
    //         });
    //         return { previousState }
    //     },
    //     queryClient: getQueryClient(),
    //     queryKeys: getQueryKeys("listCollaborators_lid", { lid }),
    // }));

    // const submit = (data: string[]) => {
    //     if (data.length > limit) return toast.error(`You can only invite ${limit} users`)
    //     else inviteMutation.mutate(data.map(u => JSON.parse(u)) as MereUser[]);
    // }

    const Wrapper = ({ children }: PropsWithChildren) => {
        return <Form submit={console.log}>{children}</Form>
    }

    return (
        <Modal buttonChildren="Invite" className="primary" id="search-followers">
            <SearchContainer
                ComponentToShow={UserCheckTile}
                queryFn={(q, p) => queryFunction(searchFollowers, [q, uid, p])}
                queryKeys={(q) => getQueryKeys("search-followers_uid_query", { uid, query: q })}
                Wrapper={Wrapper}
                placeholderSection="Invite your followers to become collaborators"
            />
        </Modal>
    )
}

export default InviteButton;