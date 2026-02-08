import { PullToRefresh } from "@components";
import { PropsWithChildren } from "react";

const Layout = ({ children }: PropsWithChildren) => (
    <PullToRefresh>
        {children}
    </PullToRefresh>
)

export default Layout;