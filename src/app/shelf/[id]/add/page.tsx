import LoginModal from "@components/fallbacks/LoginModal";
import { NotFound, ShowError } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { getCollaboratorsOfShelf } from "@lib/helpers/common";
import { fetchQuery, getQueryClient } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ParloPageProps } from "@type/other";
import { cookies } from "next/headers";
// import AddItems from "../AddItems";

const AddInListPage = async ({ params }: ParloPageProps) => {

    const [sid] = (await params).id.split('-');
    const jar = await cookies();
    const user = await getUserFromToken(jar);
    const queryClient = getQueryClient();

    if (!user) return (
        <LoginModal redirectTo={`/shelf/${sid}/add`} />
    )

    const uid = user.user_id

    const collaboratorOrCreator = await fetchQuery({
        queryClient,
        queryFn: () => getCollaboratorsOfShelf(uid, sid, jar),
        queryKey: getQueryKeys("shelfCollaborators_sid", { sid }),
    });

    if (!collaboratorOrCreator) return (
        <NotFound
            title="Oops! Looks like The Parlocula Researchers couldn't find anything."
            paras={[
                "Possible Reason: Shelf id is incorrect.",
                "Please search the shelf in the explore page",
                "If shelf is private, contact the author of the shelf."
            ]}
        />
    )

    const { collaborators, creator } = collaboratorOrCreator;

    if (creator !== uid && !collaborators.find(c => c.user_id === uid)) return (
        <ShowError
            heading="Oops! Looks the you've been arrested by The Parlocula Cops."
            errCode="unauthorized_access"
        />
    )

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {/* <AddItems sid={sid} uid={user.user_id} /> */}
        </HydrationBoundary>
    )

}

export default AddInListPage;