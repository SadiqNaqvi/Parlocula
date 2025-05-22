"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Component = () => {

    const [ref, setRef] = useState<NodeJS.Timeout | null>(null);
    const [count, setCount] = useState(0);

    const doSmth = () => {
        ref && clearTimeout(ref);
        console.log(ref);
        setCount(count + 1);
        const timeout = setTimeout(() => console.log(`Kuch hua: ${count}`), 5000)
        setRef(timeout);
    }

    return (
        <div className="size-96 flex flex-cntr-all">
            <button className="primary" onClick={doSmth}>Click me</button>
        </div>
    )
}

export default function Page() {
    const router = useRouter();
    const [show, toggleShow] = useState(false);

    const toggle = () => {
        router.prefetch("/home")
        toggleShow(!show);
    }

    // const getData = () => {
    //     fetch("https://ipinfo.io/json").then(r => r.json()).then(r => setData(JSON.stringify(r)));
    // }


    return (
        <>
            {show && <Component />}

            <button className="primary" onClick={toggle}>{show ? "Hide" : "Show"}</button>
            <Link href="/home" className="secondary btn">Navigate</Link>
        </>
    )
}