"use client";

import { useQueryHook } from "@lib/hooks";
import useCurrentUser from "@store/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User, MutationFnProps } from "@type/internal";
import { HTMLAttributes, useState } from "react";
import toast from "react-hot-toast";

type Props = {
    queryKeys: string[],
    queryFn: (user: User | null) => Promise<any>,
    Button: (arg: { state: any, isPending: boolean, onClick: (newState: any) => void }) => JSX.Element,
    mutationFn: (props: MutationFnProps) => any;
} & HTMLAttributes<HTMLButtonElement>

const defaultClasses = "px-3 py-1 rounded-md border border-gray20 flex flex-cntr-all smallBtn";

const UserBasedButton = ({ Button, queryFn, queryKeys, className, mutationFn }: Props) => {

    const { user, clearUser, setUser, updateUser, setUserHash } = useCurrentUser();
    const queryClient = useQueryClient();

    const { data, error, isFetching, refetch } = useQueryHook({
        queryFn: () => queryFn(user),
        queryKeys,
        enabled: Boolean(user),
        staleTime: 1000 * 60 * 60,
    });

    const [optimisticState, setOptimisticState] = useState(data);

    const { isPending, mutate } = useMutation({
        mutationFn,
        onMutate: ({ state }) => setOptimisticState(state),
        onError: () => setOptimisticState(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys }),
    });

    if (!user) return <Button state={null} isPending={false} onClick={() => toast.error("You need to log in!")} />

    if (isFetching) return (
        <span className={className ?? defaultClasses}>
            <span className="animate-spin size-3 inline-flex rounded-full border-2 border-b-transparent border-gray-500 aspect-square"></span>
        </span>
    )

    if (error) return (
        <button
            onClick={() => refetch()}
            className={className ?? defaultClasses}>
            ⚠Try Again
        </button>
    )

    return <Button
        state={optimisticState}
        isPending={isPending}
        onClick={(newState) => mutate({ state: newState, user, setUserHash, clearUser, setUser, updateUser })} />
}

export default UserBasedButton;