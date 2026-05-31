import generateDynamicMetadata from "@lib/seo/metadata";

export const metadata = generateDynamicMetadata({
    title: "Explore",
    description: "Browse movies, TV shows, artists, and collections. Discover new entertainment, connect with communities, and join discussions on Parlocula."
});

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            {children}
        </>
    )
}