import generateDynamicMetadata from "@lib/seo/metadata";

export const metadata = generateDynamicMetadata({});

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            {children}
        </>
    )
}