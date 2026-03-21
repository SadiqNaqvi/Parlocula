import pattern from "@assets/logo_pattern.webp";
import { Navigate } from "@components";
import { getUserFromToken } from "@lib/auth/utils";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const title = "Parlocula - Where Stories Bring Us Together";
const description =
  "Parlocula is the ultimate community for movie and show lovers. Discover wiki pages for taleons, join discussions, create shelves, share theories, and explore the world of cinema — even as a guest.";

const keywords = [
  // Primary
  "Parlocula",
  "cinema community",
  "movie discussions",
  "TV show community",
  "movie wiki platform",
  // Secondary
  "taleon wiki",
  "fan theories",
  "movie shelves",
  "TV show discussions",
  "community for film lovers",
  "cinephile platform",
  "film fan social network",
  "discussion threads movies",
  // Real-time & Features
  "real-time discussions",
  "cinema shelves",
  "movie discovery",
  "trending movies and shows",
  // Long-tail (SEO GOLD)
  "community for people who love movies and shows",
  "platform to talk about movies and tv shows",
  "social media app for movie lovers",
  "discuss films and shows online",
  "share your movie opinions",
  "join movie communities online",
].join(", ");

const url = "https://parlocula.com";
const image = "https://parlocula.com/og-image.jpg"; // replace with your real OG image

export const metadata: Metadata = {
  title,
  description,
  keywords,
  alternates: {
    canonical: url,
  },

  openGraph: {
    title,
    description,
    url,
    siteName: "Parlocula",
    images: [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: "Parlocula – Cinema Community Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
    creator: "@parlocula", // optional — change if needed
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  other: {
    "theme-color": "#000000",
  },

  // JSON-LD Structured Data
  // -------------------------
  // Helps Google understand this page is a landing homepage for a product.
  // jsonLd: {
  //   "@context": "https://schema.org",
  //   "@type": "WebSite",
  //   name: "Parlocula",
  //   url,
  //   potentialAction: {
  //     "@type": "SearchAction",
  //     target: `${url}/explore/search?q={query}`,
  //     "query-input": "required name=query",
  //   },
  //   description,
  // },
}

const IndexPage = async () => {

  const user = await getUserFromToken(await cookies());
  if (user) redirect('/home');

  return (
    <>
      <div className="patternBackground"></div>
      <header
        className="size-screen px-4 relative flex gap-4 flex-col flex-cntr-all"
      >

        <div>
          <h1 className="text-4xl font-semibold text-center">Parlocula</h1>
          <p className="text-center">The Cinematic Planet</p>
        </div>

        <div className="flex gap-2 flex-col sm:flex-row fixed sm:static bottom-0 w-full sm:w-fit sm:mx-auto p-4 bg-primarylight sm:bg-transparent rounded-t-md">
          <Navigate
            comp="link"
            goto="/join"
            type="button"
            data-testid="join-button"
            className="btn primary">
            Join as a Fan
          </Navigate>
          <Navigate
            comp="link"
            goto="/home"
            type="button"
            data-testid="join-as-guest-button"
            className="btn secondary">
            Explore as Guest
          </Navigate>
        </div>
      </header>
    </>
  );
}

export default IndexPage;
