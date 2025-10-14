import { QueryClient } from "@tanstack/react-query";
import { InfiniteQueryResponse } from "@type/internal";
import {
  AvailableQueryKeys,
  InfiniteScrollerDataType,
  QueryKeyArgs,
} from "@type/other";
import { getQueryKeys } from "./utils";

type Prev = { previousState: unknown };

type ReturnType<T> = {
  mutationFn: (args: T) => Promise<unknown>;
  onMutate: (variables: T) => Promise<Prev> | Prev;
  onError?: (error: Error, variables: unknown, context?: Prev) => unknown;
  onSuccess?: (data: unknown, variables: unknown, context?: Prev) => unknown;
};

export const mutationWrapper = <T = any>({
  mutationFn,
  optimisticWork,
  queriesToInvalidate,
  queryClient,
  queryKeys,
}: {
  mutationFn: (args: T) => Promise<unknown>;
  optimisticWork: (
    args: T,
    queryKeys: (string | number)[],
    queryClient: QueryClient
  ) => Promise<Prev> | Prev;
  queryClient: QueryClient;
  queryKeys: (string | number)[];
  queriesToInvalidate?: {
    key: AvailableQueryKeys;
    option: QueryKeyArgs<AvailableQueryKeys>;
  }[];
}): ReturnType<T> => ({
  mutationFn,
  onMutate: (args: T) => optimisticWork(args, queryKeys, queryClient),
  onSuccess: () => {
    queriesToInvalidate &&
      queriesToInvalidate.forEach(({ key, option }) => {
        queryClient.refetchQueries({ queryKey: getQueryKeys(key, option) });
      });
  },
  onError: (e, v, c) => queryClient.setQueryData(queryKeys, c?.previousState),
});

export const addingItemsMutation = async (
  data: unknown,
  queryKeys: (string | number)[],
  queryClient: QueryClient
) => {
  const arrToAdd = Array.isArray(data) ? data : [data];

  await queryClient.cancelQueries({ queryKey: queryKeys });

  const previousState = queryClient.getQueryData(queryKeys);

  queryClient.setQueryData(queryKeys, (old: InfiniteScrollerDataType) => {
    const oldData = old ?? {
      pageParams: [1],
      pages: [{ results: [], page: 1, total_pages: 2, total_results: 0 }],
    };

    const { pages } = oldData;
    const [firstPage, ...restPages] = pages;

    const { total_results, results, ...rest } = firstPage;

    const newPages = [
      {
        results: [...arrToAdd, ...results],
        total_results: total_results + 1,
        ...rest,
      },
      ...restPages,
    ];

    return { ...oldData, pages: newPages };
  });

  return { previousState };
};

export const filterItemsMutation = async (
  ids: string[],
  queryKeys: (string | number)[],
  queryClient: QueryClient
) => {
  await queryClient.cancelQueries({ queryKey: queryKeys });

  const previousState = queryClient.getQueryData(queryKeys);
  const idMap = new Map<string, boolean>(ids.map((id) => [id, true]));

  queryClient.setQueryData(queryKeys, (oldData: InfiniteScrollerDataType) => {
    if (!oldData) return oldData;

    return {
      ...oldData,
      pages: oldData.pages.map((page: InfiniteQueryResponse) => ({
        ...page,
        results: page.results.filter((result) => !idMap.get(result._id)),
      })),
    };
  });
  return { previousState };
};

export const setDataMutation = async (
  newState: unknown,
  queryKeys: (string | number)[],
  queryClient: QueryClient
) => {
  await queryClient.cancelQueries({ queryKey: queryKeys });

  const previousState = queryClient.getQueryData(queryKeys);

  queryClient.setQueryData(queryKeys, newState);
  return { previousState };
};

export const updateMutation = async (
  dataToPatch: Record<string, unknown>,
  queryKeys: (string | number)[],
  queryClient: QueryClient
) => {
  await queryClient.cancelQueries({ queryKey: queryKeys });

  const previousState = queryClient.getQueryData(queryKeys);

  queryClient.setQueryData(queryKeys, (prev: Record<string, unknown>) => {
    if (!prev) return prev;
    return { ...prev, ...dataToPatch };
  });
  return { previousState };
};
