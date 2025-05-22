import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60,
      },
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: (query: any) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });

let browserQueryClient: QueryClient | undefined = undefined;

export const getQueryClient = () => {
  if (isServer) return makeQueryClient();
  else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
};
