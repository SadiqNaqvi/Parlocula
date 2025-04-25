import { Sidebar } from "@components";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {

    return (
        <>
            <Sidebar />
            <main>
                {children}
            </main>
        </>
    )
}