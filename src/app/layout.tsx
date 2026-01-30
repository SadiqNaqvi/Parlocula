import "@/app/globals.css";
import { FancyBoxProvider } from "@components";
import { MainLoading } from "@components/ui/loading";
import { getUserFromToken } from "@lib/auth/utils";
import { getCurrentUser } from "@lib/helpers/common";
import { fetchQuery, getQueryClient } from "@lib/providers/queryClient";
import ReactQueryProvider from "@lib/providers/ReactQueryWrapper";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { cookies } from "next/headers";
import { PropsWithChildren, Suspense } from "react";
import { Toaster } from "sonner";
import UserHydrator from "./UserHydrator";
import { Montserrat, Roboto } from "next/font/google"

const montserratFont = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const robotoFont = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

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
      <body className={`${robotoFont.variable} ${montserratFont.variable} antialiased`}>
        <Toaster swipeDirections={["bottom", "left", "right"]} />
        <ReactQueryProvider>
          <ThemeProvider enableSystem defaultTheme="system" attribute={"class"}>
            <FancyBoxProvider>
              <Suspense fallback={<MainLoading />}>
                <NotificationFetcher>
                  {children}
                </NotificationFetcher>
              </Suspense>
            </FancyBoxProvider>
          </ThemeProvider>
        </ReactQueryProvider>
        {/* <script src="https://kit.fontawesome.com/5d93eb1089.js"></script> */}

      </body>
    </html>
  );
}

export default RootLayout;
