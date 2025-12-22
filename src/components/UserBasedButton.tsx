"use client";

import { useQueryHook } from "@lib/hooks";
import { AvailableMutations, MutationFunctionAgruments, performMutation, setMutation } from "@lib/providers/mutationStore";
import appToast from "@lib/providers/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

type OnClickFunc = <M extends AvailableMutations, T>(newState: T, action: M, args: MutationFunctionAgruments<M>) => void

export type UserBasedButtonProps<T> = {
    state: T | null | undefined;
    user_id: string;
    onClick: OnClickFunc;
};

type Props<T> = {
    queryKeys: string[],
    uid: string | undefined,
    queryFn: (user_id: string) => Promise<any>,
    Button: (arg: UserBasedButtonProps<T>) => JSX.Element,
    className?: string,
    Loading?: React.ReactNode,
}

export const LoadingButton = ({ primary = true }: { primary?: boolean }) => (
    <button className={primary ? "primary gap-3" : undefined}>
        <span className="animate-spin size-3 inline-flex rounded-full border-2 border-b-transparent border-gray-500 aspect-square"></span>
        {primary && <span>Loading...</span>}
    </button>
);

const UserBasedButton = <T,>({ Button, queryFn, queryKeys, className, Loading, uid }: Props<T>) => {

    const queryClient = useQueryClient();

    const mutation_id = queryKeys.join("-");

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const { data, error, isLoading, refetch } = useQueryHook<T>({
        queryFn: () => queryFn(uid ?? ""),
        queryKeys,
        enabled: Boolean(uid),
    });

    if (!uid) return (
        <Button state={null} user_id="" onClick={() => appToast.error("You need to log in!")} />
    )

    const LoadingComponent = Loading ?? <LoadingButton />;

    if (isLoading) return LoadingComponent;

    else if (error) return (
        <button
            onClick={() => refetch()}
            className={className || "secondary"}>
            ⚠Try Again
        </button>
    )

    const handleClick = <M extends AvailableMutations, T>(newState: T, action: M, args: MutationFunctionAgruments<M>) => {

        // Optimistic update
        queryClient.setQueryData(queryKeys, newState);

        // Save latest intent to local queue (overwrite)
        setMutation(mutation_id, { payload: args, type: action });

        // Trigger debounce logic
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            const previousState = queryClient.getQueryData(queryKeys);

            performMutation(mutation_id)
                .then(completed => {
                    if (!completed) {
                        queryClient.setQueryData(queryKeys, previousState);
                    }
                });

        }, 10000);
    };

    return <Button user_id={uid} state={data} onClick={handleClick} />
}

export default UserBasedButton;