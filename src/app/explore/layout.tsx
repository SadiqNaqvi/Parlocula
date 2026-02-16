import generateDynamicMetadata from "@lib/seo/metadata";

export const metadata = generateDynamicMetadata({ title: "Explore" });

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            {children}
        </>
    )
}