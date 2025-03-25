import { Sidebar } from "@components";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <main className="*:max-w-screen-md withoutSidebar *:mx-auto p-4">
            {children}
        </main>
    )
}