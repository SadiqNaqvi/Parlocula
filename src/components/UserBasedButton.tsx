"use client";

import { useQueryHook } from "@lib/hooks";
import useCurrentUser from "@store/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationFnProps } from "@type/other";
import { HTMLAttributes, useState } from "react";
import toast from "react-hot-toast";

type Props = {
    queryKeys: string[],
    queryFn: (user_id: string) => Promise<any>,
    Button: (arg: { state: any, isPending: boolean, onClick: (newState: any, action: any) => void }) => JSX.Element,
    mutationFn: (_: MutationFnProps) => any;
} & HTMLAttributes<HTMLButtonElement>

const UserBasedButton = ({ Button, queryFn, queryKeys, className, mutationFn }: Props) => {

    const { user } = useCurrentUser();
    const queryClient = useQueryClient();

    const { data, error, isFetching, refetch } = useQueryHook({
        queryFn: () => queryFn(user?._id || ""),
        queryKeys,
        enabled: Boolean(user),
        staleTime: 1000 * 60 * 60,
    });

    const [optimisticState, setOptimisticState] = useState(data);

    const { isPending, mutate } = useMutation({
        mutationFn,
        onMutate: ({ newState }) => setOptimisticState(newState),
        onError: () => setOptimisticState(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys }),
    });

    if (!user) return <Button state={null} isPending={false} onClick={() => toast.error("You need to log in!")} />

    if (isFetching) return (
        <button className={className || "bigBtn primary gap-3"}>
            <span className="animate-spin size-3 inline-flex rounded-full border-2 border-b-transparent border-gray-500 aspect-square"></span>
            Loading...
        </button>
    )

    if (error) return (
        <button
            onClick={() => refetch()}
            className={className || "secondary bigBtn"}>
            ⚠Try Again
        </button>
    )

    return <Button
        state={optimisticState}
        isPending={isPending}
        onClick={(newState, action) => mutate({ newState, action, user_id: user._id })} />
}

export default UserBasedButton;