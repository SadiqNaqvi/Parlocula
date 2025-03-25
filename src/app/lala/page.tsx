"use client";
import { useState } from "react";

export default function Page() {
    const [data, setData] = useState<any>("")

    const getData = () => {
        fetch("/api/lala", { next: { revalidate: 0 } }).then(res => setData(res.text()));
    }


    return (
        <>
            {data}

            <button className="primary" onClick={getData}>Get Data</button>
        </>
    )
}