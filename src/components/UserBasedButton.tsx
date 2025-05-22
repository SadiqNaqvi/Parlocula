"use client";

import { useQueryHook } from "@lib/hooks";
import useCurrentUser from "@store/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationFnProps } from "@type/other";
import { HTMLAttributes } from "react";
import toast from "react-hot-toast";

type Props = {
    queryKeys: string[],
    queryFn: (user_id: string) => Promise<any>,
    Button: (arg: { state: any, isPending: boolean, onClick: (newState: any, action: any) => void }) => JSX.Element,
    mutationFn: (_: MutationFnProps) => any;
    Loading?: React.ReactNode,
} & HTMLAttributes<HTMLButtonElement>

export const LoadingButton = () => (
    <button className={"primary gap-3"}>
        <span className="animate-spin size-3 inline-flex rounded-full border-2 border-b-transparent border-gray-500 aspect-square"></span>
        <span>Loading...</span>
    </button>
)

const UserBasedButton = ({ Button, queryFn, queryKeys, className, mutationFn, Loading }: Props) => {

    const { user, isHydrated } = useCurrentUser();
    const queryClient = useQueryClient();

    const { data, error, isFetching, refetch } = useQueryHook({
        queryFn: () => queryFn(user?._id || ""),
        queryKeys,
        enabled: Boolean(user && isHydrated),
        staleTime: 1000 * 60 * 60,
    });

    const { isPending, mutate } = useMutation({
        mutationFn,
        onMutate: async ({ newState }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys });

            const previousState = queryClient.getQueryData(queryKeys);

            queryClient.setQueryData(queryKeys, newState);

            return { previousState };
        },
        onError: (e, _, c) => queryClient.setQueryData(queryKeys, c?.previousState),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys }),
    });

    if (!isHydrated) return <LoadingButton />

    if (!user) return <Button state={null} isPending={false} onClick={() => toast.error("You need to log in!")} />

    const LoadingComponent = Loading ?? <LoadingButton />;

    if (isFetching) return LoadingComponent;

    if (error) return (
        <button
            onClick={() => refetch()}
            className={className || "secondary"}>
            ⚠Try Again
        </button>
    )

    return <Button
        state={data}
        isPending={isPending}
        onClick={(newState, action) => mutate({ newState, action, user_id: user._id })} />
}

export default UserBasedButton;