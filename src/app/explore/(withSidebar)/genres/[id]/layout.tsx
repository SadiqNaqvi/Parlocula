"use client";

import { useState } from "react";

export default function Layout({ children, movies, shows }: Readonly<{ children: React.ReactNode, movies: React.ReactNode, shows: React.ReactNode }>) {
    const [tab, setTab] = useState("movies");

    const handleTab = (entry: string) => {
        if (tab === entry) return;
        setTab(entry);
    }

    return (
        <main className="max-w-screen-lg p-4 mx-auto w-full">
            {children}
            <ul className="flex mt-4 gap-4 sticky top-0 z-[1] bg-primary py-2">
                <li onClick={() => handleTab("movies")} className={`px-4 py-2 cursor-pointer border-b-2 transition-colors border-transparent ${tab === "movies" ? "border-secondary" : "hover:border-zinc-500"}`}>Movies</li>
                <li onClick={() => handleTab("shows")} className={`px-4 py-2 cursor-pointer border-b-2 transition-colors border-transparent ${tab === "shows" ? "border-secondary" : "hover:border-zinc-500"}`}>Shows</li>
            </ul>
            {movies}
            {/* {tab === "movies" ? movies : shows} */}
        </main>
    );
}