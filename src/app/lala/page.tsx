"use client";
import Link from "next/link";
import { useState } from "react"

export default function Page() {
    const [data, setData] = useState<any>("")

    const getData = () => {
        console.log(process.env.NEXT_PUBLIC_SALT);
    }


    return (
        <>
            {data}

            <button className="primary" onClick={getData}>Get Data</button>
            <Link href="/join">Join</Link>
        </>
    )
}