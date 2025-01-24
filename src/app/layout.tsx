"use client";

import { Montserrat } from "next/font/google";
import "@/app/globals.css";
import ReactQueryProvider from "@lib/queryClient";
import useCurrentUser from "@store/user";
import { decodeObject } from "@lib/utils";
import { User } from "@type/internal";
import { useEffect } from "react";

const fontFam = Montserrat({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700"] });

const fetchUser = (user: User & { object_expiry: number }, setUser: (data: User) => void, setUserHash: (data: User) => void, clearUser: () => void) => {
  if (!user) return;
  setUser(user);
  if (user.object_expiry < Date.now()) {
    fetch(`${process.env.__NEXT_PRIVATE_ORIGIN || ""}/api/user`, {
      cache: "force-cache",
      next: {
        revalidate: 60 * 60 * 24,
        tags: [`userdata-${user._id}`],
      },
    })
      .then((res) => res.json())
      .then((data: { result: User | null }) => data.result ? setUserHash(data.result) : clearUser())
      .catch((err: any) => console.log("Failed to fetch and store user:", err))
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const { userhash, setUser, setUserHash, clearUser } = useCurrentUser();

  useEffect(() => {
    if (userhash) {
      const decoded = decodeObject(userhash);
      fetchUser(decoded, setUser, setUserHash, clearUser);
    }
  }, [userhash])

  return (
    <html lang="en">
      <body className={`${fontFam.className} dark`}>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
        {/* <script src="https://kit.fontawesome.com/5d93eb1089.js"></script> */}
      </body>
    </html>
  );
}
