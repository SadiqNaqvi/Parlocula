import { ParloFooter } from "@components/ui";

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
    <main>
        {children}
        <ParloFooter />
    </main>
)

export default Layout;