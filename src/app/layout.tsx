"use client";

import "@/app/globals.css";
import Fancybox from "@components/Fancybox";
import { fetchCurrentUser } from "@lib/helpers/client";
import ReactQueryProvider from "@lib/queryClient";
import useCurrentUser from "@store/user";
import { Montserrat } from "next/font/google";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

const fontFam = Montserrat({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const { isHydrated, clearUser, getUserFromHash, setUser, setUserHash } = useCurrentUser();
  useEffect(() => {
    if (isHydrated)
      fetchCurrentUser({ clearUser, getUserFromHash, setUser, setUserHash });
  }, [isHydrated])

  return (
    <html lang="en">
      <body className={`${fontFam.className} dark`}>
        <Toaster position="top-center" />
        <ReactQueryProvider>
          <Fancybox>
            {children}
          </Fancybox>
        </ReactQueryProvider>
        {/* <script src="https://kit.fontawesome.com/5d93eb1089.js"></script> */}
      </body>
    </html>
  );
}
