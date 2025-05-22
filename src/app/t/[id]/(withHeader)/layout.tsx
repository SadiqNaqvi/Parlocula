"use client";

import { PropsWithChildren } from "react";
import Thread from "./Thread";

const ThreadLayout = ({ children, params }: PropsWithChildren<{ params: { id: string } }>) => {

    const { id } = params;

    return (
        <Thread id={id}>
            {children}
        </Thread>
    )

}

export default ThreadLayout;