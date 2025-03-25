import { Sidebar } from "@components";

export default function ExploreLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <>
            <Sidebar />
            <main className="*:max-w-screen-md *:mx-auto p-4">
                {children}
            </main>
        </>
    );
}