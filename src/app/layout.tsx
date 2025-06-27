import "@/app/globals.css";
import Fancybox from "@components/Fancybox";
import ReactQueryProvider from "@lib/provider";
import { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from "react-hot-toast";
import UserHydrator from "./UserHydrator";

const fontFam = Montserrat({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Popcorn Paragon",
  description: "Stop Searching Start Watching",
  keywords: "movies, tv shows, web series, movie recommendation, movie recommendation system, tv show recommendation system, movies suggestion, movie suggestion, show suggestion, series suggestion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={`${fontFam.className}`}>
        <Toaster position="top-center" />
        <ReactQueryProvider>
          <Fancybox>
            <UserHydrator />
            {children}
          </Fancybox>
        </ReactQueryProvider>
        {/* <script src="https://kit.fontawesome.com/5d93eb1089.js"></script> */}
      </body>
    </html>
  );
}
