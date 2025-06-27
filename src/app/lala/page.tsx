"use client";
import { useState } from "react";

export default function Page() {
    const [data, setData] = useState('');

    const getData = () => {
        setData("Noting is programmed")
    }

    return (
        <div>
            <p>{data}</p>
            <button className="primary" onClick={getData}>Click me</button>
        </div>
    )
}