import { NotFound, ShowError } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { getMessages, getRoomById, getUserByUsername } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery, prefetchQuery } from "@lib/providers/queryClient";
import { getQueryKeys, isValidParloId } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import ChatSection from "./ChatSection";

const RoomSection = async ({ params: { id } }: { params: { id: string } }) => {

    const queryClient = getQueryClient();
    const [rmid] = id.split('-');
    const jar = cookies();
    const user = await getUserFromToken(jar);

    if (!user) return null;

    else if (!rmid) return (
        <NotFound
            title="Oops! Looks like the Popcorn Searchers couldn't find anything"
            paras={["Please search the user in the explore page."]}
            fullScreen
        />
    )

    else if (!isValidParloId(rmid)) return (
        <div className="forceCenter">
            <ShowError
                heading="Oops! Looks like the Popcorn Cop has stopped you"
                messages={["Room id is invalid!", "Please search the user by their username in the explore page."]}
            />
        </div>
    )

    Promise.all([
        prefetchQuery({
            queryClient,
            queryFn: () => getRoomById(user.user_id, rmid, jar),
            queryKey: getQueryKeys("room_rmid_uid", { rmid, uid: user.user_id }),
        }),
        prefetchInfiniteQuery({
            queryClient,
            queryFn: () => getMessages(user.user_id, rmid, 1, jar),
            queryKey: getQueryKeys("messages_rmid", { rmid }),
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <section className="flex-1 h-stretch">
                <ChatSection rmid={rmid} uid={user.user_id} />
            </section>
        </HydrationBoundary>
    );
}

export default RoomSection;