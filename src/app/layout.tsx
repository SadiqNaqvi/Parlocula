"use client";

import { Montserrat } from "next/font/google";
import "@/app/globals.css";
import ReactQueryProvider from "@lib/queryClient";
import useCurrentUser from "@store/user";
import { useEffect } from "react";
import { fetchCurrentUser } from "@lib/actions/clientActions";
import { ToastBar, Toaster } from "react-hot-toast";

const fontFam = Montserrat({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const { isGuest, clearUser, getUserFromHash, setUser, setUserHash } = useCurrentUser();
  useEffect(() => {
    if (isGuest === false)
      fetchCurrentUser({ clearUser, getUserFromHash, setUser, setUserHash });
  }, [isGuest])

  return (
    <html lang="en">
      <body className={`${fontFam.className} dark`}>
        <Toaster  position="top-center" />
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
        {/* <script src="https://kit.fontawesome.com/5d93eb1089.js"></script> */}
      </body>
    </html>
  );
}
