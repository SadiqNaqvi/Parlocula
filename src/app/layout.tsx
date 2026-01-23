import "@/app/globals.css";
import Fancybox from "@components/Fancybox";
import MainLoader from "@components/ui/loading/mainLoading";
import { getUserFromToken } from "@lib/auth/utils";
import { getCurrentUser, getNotificationsOfUser } from "@lib/helpers/common";
import { fetchQuery, getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import ReactQueryProvider from "@lib/providers/ReactQueryWrapper"
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Montserrat } from "next/font/google";
import { cookies } from "next/headers";
import { PropsWithChildren, Suspense } from "react";
import { Toaster } from "sonner";
import UserHydrator from "./UserHydrator";

// const fontFam = Montserrat({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Parlocula - Where Stories Bring Us Together",
  description: "Stop Searching Start Watching",
  keywords: "movies, tv shows, web series, movie recommendation, movie recommendation system, tv show recommendation system, movies suggestion, movie suggestion, show suggestion, series suggestion",
};

const NotificationFetcher = async ({ children }: PropsWithChildren) => {

  const queryClient = getQueryClient();

  const jar = await cookies();
  const payload = await getUserFromToken(jar);

  if (payload) {
    const { user_id, username } = payload;

    //   queryClient.prefetchInfiniteQuery({
    //     queryKey: getQueryKeys("rooms_uid", { uid: user_id }),
    //     queryFn: () => queryFunction(getRooms, [user_id, 1, jar], 1),
    //     initialPageParam: 1,
    //   });

    const [resp] = await Promise.all([
      fetchQuery({
        queryClient,
        queryKey: getQueryKeys("user_username", { username }),
        queryFn: () => getCurrentUser(user_id, jar),
      }),
      // prefetchInfiniteQuery({
      //   queryClient,
      //   initialPageParam: 1,
      //   queryKey: getQueryKeys("notifications_uid", { uid: user_id }),
      //   queryFn: () => getNotificationsOfUser(user_id, 1, jar)
      // }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
      <UserHydrator payload={payload} />
    </HydrationBoundary>
  )
}

const RootLayout = async ({
  children,
}: PropsWithChildren) => {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* {*<body className={`${fontFam.className}`}>} */}
      <body>
        <Toaster swipeDirections={["bottom", "left", "right"]} />
        <ReactQueryProvider>
          <ThemeProvider enableSystem defaultTheme="system" attribute={"class"}>
            <Fancybox>
              <Suspense fallback={<MainLoader />}>
                <NotificationFetcher>
                  {children}
                </NotificationFetcher>
              </Suspense>
            </Fancybox>
          </ThemeProvider>
        </ReactQueryProvider>
        {/* <script src="https://kit.fontawesome.com/5d93eb1089.js"></script> */}

      </body>
    </html>
  );
}

export default RootLayout;
