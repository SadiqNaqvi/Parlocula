import { NotFound, ShowError } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { getMessages, getRoomById, getUserByUsername } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, isValidObjectId, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import ChatSection from "./ChatSection";

const RoomSection = async ({ params: { id } }: { params: { id: string } }) => {

    const queryClient = getQueryClient();
    const [rmid, username, ruid] = id.split('-');
    const jar = cookies();
    const user = await getUserFromToken(jar);

    if (!user) return null;

    else if (!rmid) return (
        <div className="forceCenter">
            <NotFound
                title="Oops! Looks like the Popcorn Searchers couldn't find anything"
                paras={["Please search the user in the explore page."]}
            />
        </div>
    )

    else if (!isValidObjectId(rmid)) return (
        <div className="forceCenter">
            <ShowError
                heading="Oops! Looks like the Popcorn Cop has stopped you"
                messages={["Room id is invalid!", "Please search the user by their username in the explore page."]}
            />
        </div>
    )

    Promise.all([
        queryClient.prefetchQuery({
            queryFn: () => queryFunction(getRoomById, [user.user_id, rmid, jar]),
            queryKey: getQueryKeys("room_rmid_uid", { rmid, uid: user.user_id }),
        }),
        queryClient.prefetchQuery({
            queryFn: () => queryFunction(getUserByUsername, [username]),
            queryKey: getQueryKeys("user_username", { username }),
        }),
        queryClient.prefetchInfiniteQuery({
            queryFn: () => queryFunction(getMessages, [user.user_id, rmid, 1, jar], 1),
            queryKey: getQueryKeys("messages_rmid", { rmid }),
            initialPageParam: 1,
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <section className="flex-1 h-stretch">
                <ChatSection ruid={ruid} username={username} rmid={rmid} uid={user.user_id} />
            </section>
        </HydrationBoundary>
    );
}

export default RoomSection;