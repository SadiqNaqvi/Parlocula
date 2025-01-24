"use client";

import useCurrentUser from "@store/user";
import { useQuery } from "@tanstack/react-query";
import { GeneralSingleReturn } from "@type/internal";

export const ButtonLoading = () => (
    <button className="secondary">
        <span className="animate-spin size-4 border border-l-0 border-invert"></span>
    </button>
)

const fetchData = async (t_id: string, u_id: string) => {
    const { success, result, error }: GeneralSingleReturn<Boolean> = await fetch(`${process.env.__NEXT_PRIVATE_ORIGIN}/api/threads/${t_id}/${u_id}`).then(res => res.json());
    if (!success) throw new Error(error);
    return result;
}

const JoinButton = ({ tid }: { tid: string }) => {

    const { user } = useCurrentUser();

    if (!user) return <button className="primary">Join</button>

    const { data, error, isFetching, refetch } = useQuery({
        queryKey: [`isJoined-thread:${tid}-user:${user._id}`],
        queryFn: async () => await fetchData(tid, user._id),
        retryOnMount: false, refetchOnWindowFocus: false, refetchOnMount: false, refetchOnReconnect: false
    });

    const handleRefetch = () => refetch();

    if (isFetching) return <ButtonLoading />

    if (error) return <button className="border border-gray40" onClick={handleRefetch}>Try Again</button>


    return (
        <>{data ?
            <button className="secondary">Joined</button>
            :
            <button className="primary">Join</button>
        }
        </>
    )
}

export default JoinButton;