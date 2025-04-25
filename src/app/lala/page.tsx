"use client";
import { useState } from "react";

export default function Page() {
    const [data, setData] = useState<any>("");

    const getData = () => {
        fetch("https://ipinfo.io/json").then(r => r.json()).then(r => setData(JSON.stringify(r)));
    }


    return (
        <>
            {data}

            <button className="primary" onClick={getData}>Get Data</button>
        </>
    )
}