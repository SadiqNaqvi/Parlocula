import { PullToRefresh } from "@components";
import { ParloFooter } from "@components/ui";

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
    <PullToRefresh>
        {children}
        <ParloFooter />
    </PullToRefresh>
)

export default Layout;