"use client";
import { useRouter, usePathname } from "next/navigation";
import { LeftChevron, RightChevron, XmarkIcon } from "@assets/Icons";
import { useState } from "react";

export default function TrailerComponent({ content }: { content: { name: string; key: string }[] }) {

    const router = useRouter();
    const pathname = usePathname();

    const [trailerNumber, setTrailerNumber] = useState(0);

    return (
        <>
            <div className="absolute h-dvh w-dvw z-[2] top-0">
                <div className="h-16 w-full flex flex-cntr-between px-4 bg-[var(--primary)]">
                    <h2 className="text-xl">Trailer {content.length > 1 && trailerNumber + 1} </h2>
                    <button className="iconBtn" onClick={() => router.push(pathname.split("?")[0], { scroll: false })}>
                        <XmarkIcon />
                    </button>
                </div>
                <div className="w-full h-full flex flex-cntr-even bg-[var(--primary)]">
                    {content.length > 1 && trailerNumber === 0 ?
                        <button className="iconBtn disable">
                            <LeftChevron />
                        </button>
                        :
                        <button className="iconBtn border-[var(--gray40)]" onClick={() => setTrailerNumber(prev => prev - 1)}>
                            <LeftChevron />
                        </button>
                    }

                    <iframe onLoad={() => console.log("loaded")} className="w-[90%] h-full rounded-md" src={`https://www.youtube.com/embed/${content[trailerNumber].key}`}></iframe>

                    {content.length > 1 && trailerNumber + 1 === content.length ?
                        <button className="iconBtn disable">
                            <RightChevron />
                        </button>
                        :
                        <button className="iconBtn border-[var(--gray40)]" onClick={() => setTrailerNumber(prev => prev + 1)}>
                            <RightChevron />
                        </button>
                    }
                </div>
            </div>
        </>
    )
}