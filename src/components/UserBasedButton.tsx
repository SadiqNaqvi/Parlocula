"use client";

import { useQueryHook } from "@lib/hooks";
import useCurrentUser from "@store/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationFnProps } from "@type/other";
import { HTMLAttributes, useCallback, useRef } from "react";
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
);

const MUTATION_MAP_KEY = "user_mutation_queue";

const getMutationQueueMap = (): Record<string, any> => {
    try {
        const raw = localStorage.getItem(MUTATION_MAP_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

const setMutationQueueMap = (map: Record<string, any>) => {
    localStorage.setItem(MUTATION_MAP_KEY, JSON.stringify(map));
}

const updateMutationInQueue = (queueId: string, data: any) => {
    const map = getMutationQueueMap();
    map[queueId] = data;
    setMutationQueueMap(map);
}

const clearMutationFromQueue = (queueId: string) => {
    const map = getMutationQueueMap();
    delete map[queueId];
    setMutationQueueMap(map);
}

const getAllQueuedMutations = (): [string, any][] => {
    const map = getMutationQueueMap();
    return Object.entries(map);
}

const UserBasedButton = ({ Button, queryFn, queryKeys, className, mutationFn, Loading }: Props) => {

    const { user, isHydrated } = useCurrentUser();
    const queryClient = useQueryClient();

    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const queueId = queryKeys.join("-");

    const { data, error, isFetching, refetch } = useQueryHook({
        queryFn: () => queryFn(user?._id || ""),
        queryKeys,
        enabled: Boolean(user && isHydrated),
        staleTime: 1000 * 60 * 60,
    });

    const { isPending, mutateAsync } = useMutation({
        mutationFn,
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: queryKeys });

            const previousState = queryClient.getQueryData(queryKeys);

            return { previousState };
        },
        onError: (a, _, c) => queryClient.setQueryData(queryKeys, c?.previousState),
    });

    const debounceMutation = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            const queued = getAllQueuedMutations();

            for (const [key, data] of queued) {
                try {
                    await mutateAsync(data);
                    clearMutationFromQueue(key);
                } catch (e) {
                    console.error(`Mutation failed for ${key}`, e);
                }
            }
        }, 30000);
    }, [mutateAsync]);

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

    const handleClick = (newState: any, action: any) => {
        const payload = { newState, action, user_id: user._id };

        // Optimistic update
        queryClient.setQueryData(queryKeys, newState);

        // Save latest intent to local queue (overwrite)
        updateMutationInQueue(queueId, payload);

        // Trigger debounce logic
        debounceMutation();
    };

    return <Button
        state={data}
        isPending={isPending}
        onClick={handleClick} />
}

export default UserBasedButton;