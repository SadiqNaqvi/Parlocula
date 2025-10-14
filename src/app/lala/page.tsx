"use client";
import { disablePush, enablePush } from "@lib/providers/notification";
import toast from "react-hot-toast";

export default function Page() {
    const send = () => {
        fetch("/api/v1/ably", { method: "POST" }).then(() => toast.success("Sent successfully "))
    }

    const subscribe = () => {
        enablePush("67f6da546669e8c6f4b7315d");
    }

    const unsubscribe = () => {
        disablePush("67f6da546669e8c6f4b7315d");
    }

    return (
        <div className="flex gap-3">
            {/* <button className="primary" onClick={subscribe}>Subscribe</button>
            <button className="primary" onClick={unsubscribe}>Unsubscribe</button> */}
            <button className="primary" onClick={send}>Send</button>
        </div>
    )

    // return (
    //     <PullToRefresh>
    //         <div className="h-[200dvh]">
    //             Some Data here
    //         </div>
    //     </PullToRefresh>
    // )
}