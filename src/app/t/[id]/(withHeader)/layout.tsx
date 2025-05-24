"use client";

import { PropsWithChildren } from "react";
import Thread from "./Thread";
import { isValidObjectId } from "@lib/utils";
import { NotFound } from "@components/ui";

const ThreadLayout = ({ children, params }: PropsWithChildren<{ params: { id: string } }>) => {

    const { id } = params;
    const tid = id.split('-')[0];
    
    if (!isValidObjectId(tid)) return (
        <NotFound
            title="Oops! Look's like you came across a wrong path."
            paras={["Content id is incorrect", "Please go back and try again."]}
        />
    );

    return (
        <Thread id={id}>
            {children}
        </Thread>
    )

}

export default ThreadLayout;