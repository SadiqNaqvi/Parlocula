import { NotFound, ShowError } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { getCollaboratorsOfList } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ListCollaborators } from "@type/internal";
import { cookies } from "next/headers";
import Collaborators from "./Collaborators";

const CollaboratorsPage = async ({ params: { id } }: { params: { id: string } }) => {

    const jar = cookies();
    const user = await getUserFromToken(jar);

    if (!user) return (
        <section className="size-screen">
            <ShowError
                heading="You need to log-in to go through"
                errCode="unauthenticated_access"
            />
        </section>
    )

    const lid = id.split('-')[0];

    const queryClient = getQueryClient();
    
    const list = await queryClient.fetchQuery({
        queryKey: getQueryKeys("listCollaborators_lid", { lid }),
        queryFn: () => queryFunction(getCollaboratorsOfList, [user.user_id, lid, jar]) as Promise<ListCollaborators>,
    });

    if (!list) return (
        <section className="size-screen">
            <NotFound
                title="Oops! Looks like the popcorn is missing"
                paras={["A List could not be found with the provided id.", "Please search it in the explore page"]}
            />
        </section>
    )

    else if (list.user_id !== user.user_id) return (
        <section className="size-screen">
            <ShowError
                heading="Oops! Looks like we could'nt proceed"
                errCode="unauthorized_access"
            />
        </section>
    )

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Collaborators name={list.name} uid={user.user_id} lid={lid} />
        </HydrationBoundary>
    )
}

export default CollaboratorsPage;