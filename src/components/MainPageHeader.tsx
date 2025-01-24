"use client";

import { BookmarkIcon, CollectionIcon, EditIcon, Ellipsis, HeartIcon, LeftChevron, PlayIcon, PlaylistIcon, ShareIcon, StarIcon, ThreadIcon, WarningIcon } from "@assets/Icons";
import { getPoster } from "@lib/dataRefiner";
import { RefinedMovieData } from "@lib/types";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import OptionMenu from "./OptionMenu";
import Navigate from "./Navigate";

export default function MainPageHeader({ content }: { content: RefinedMovieData }) {
    const router = useRouter();
    const pathname = usePathname();

    const titleRef = useRef(null);
    const [isInvisible, setIsInvisible] = useState(false);
    const [optionMenu, setOptionMenu] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting)
                setIsInvisible(false);
            else setIsInvisible(true);
        });

        if (titleRef.current)
            observer.observe(titleRef.current);

        return () => {
            if (titleRef.current)
                observer.unobserve(titleRef.current);
        }
    }, [titleRef]);

    const metadata = [
        { label: "Rating", val: content.tmdb_rating },
        { label: "Rated", val: content.rated },
        { label: "Runtime", val: content.runtime },
        { label: "Year", val: content.year },
    ]

    const menuOptions = [
        {
            icon: StarIcon,
            label: "Mark as Favourite",
            func: () => { console.log("click hua") },
        },
        {
            icon: HeartIcon,
            label: "Add to Suggestion",
            func: () => { }
        },
        {
            icon: BookmarkIcon,
            label: "Add to Watchlist",
            func: () => { }
        },
        {
            icon: PlaylistIcon,
            label: "Add to Playlist",
            func: () => { }
        },
        {
            icon: ThreadIcon,
            label: "Visit Thread",
            func: () => { }
        },
        {
            icon: CollectionIcon,
            label: "Visit Collection",
            func: () => { }
        },
        {
            icon: EditIcon,
            label: "Edit page",
            func: () => { }
        },
    ]

    return (
        <>
            <header>
                <nav className="backdrop-brightness-75 overflow-hidden w-full fixed top-0 z-[2] h-12 md:h-16 flex flex-cntr-between sm:px-4">
                    {isInvisible &&
                        <div className="background-all z-[-1] absolute inset-0 blur-sm brightness-50 -top-1" style={{ backgroundImage: `url(${getPoster("backdrop", content.backdrop, 0)})`, backgroundPosition: "center" }}></div>
                    }
                    <div className="flex sm:gap-4 items-center">
                        <Navigate comp="button" goto="back" className="iconBtn">
                            <LeftChevron />
                        </Navigate>
                        {isInvisible &&
                            <h1 className="text-base line-clamp-1 sm:text-2xl uppercase font-semibold">{content.title}</h1>
                        }
                    </div>
                    <div className="flex gap-2">
                        <button className="iconBtn">
                            <ShareIcon />
                        </button>
                        {/* <OptionMenu close={() => setOptionMenu(false)}>
                        {menuOptions.map(el => (
                            <li key={el.label} className="h-12 border-b px-2 md:px-4 border-[var(--gray20)] active:bg-[var(--gray10)] md:hover:bg-[var(--gray10)] transition-colors">
                                <button className="noPadding justify-start border-0 h-full w-full" onClick={el.func}>
                                    <el.icon />
                                    {el.label}
                                </button>
                            </li>
                        ))}
                    </OptionMenu> */}
                        <button className="iconBtn" onClick={() => setOptionMenu(true)}>
                            <Ellipsis />
                        </button>
                    </div>
                </nav>
                <div className="h-40 md:h-60 w-full background-all" style={{ backgroundImage: `url(${getPoster("backdrop", content.backdrop, 2)})` }}></div>
            </header>
            <section className="-mt-4 bg-[var(--primary)] md:mt-0 rounded-t-2xl mx-auto max-w-screen-lg relative px-2 lg:px-0">
                <div className="flex gap-4">
                    <img src={`${getPoster("poster", content.poster, 2)}`} className="border-4 border-[var(--primary)] object-cover aspect-square w-24 sm:w-40 ml-2 md:ml-0 translate-y-[-25%] rounded-md" alt="" />
                    <div className="w-fit h-fit flex gap-2 sm:gap-4 pt-4">
                        {metadata.map(el => (
                            <div key={el.label} className="border-0 gap-1 md:gap-2 flex flex-col flex-cntr-all md:flex-row md:p-4 sm:border border-[var(--gray20)] rounded-md">
                                <span>{el.val}</span>
                                <label className="text-xs sm:text-sm text-zinc-500">{el.label}</label>
                            </div>
                        ))}
                    </div>
                </div>
                <h1 ref={titleRef} className="text-xl sm:text-4xl -mt-4 md:-mt-8 font-semibold uppercase">{content.title}</h1>
                <p className="text-sm md:text-base text-zinc-500">{content.tagline}</p>
                <div className="my-4 flex gap-3 md:gap-4">
                    {content.genres.slice(0, 3).map(el => (
                        <Link key={el} href={`/explore/genre?q=${el.toLowerCase().replaceAll(' ', '-')}`} className="text-sm md:text-base">{el}</Link>
                    ))}
                </div>
                <p className="text-sm text-gray-500 line-clamp-4">{content.overview}</p>
                <div className="mt-4 text-sm flex gap-2">
                    <button className="primary textWithIcon flex-grow sm:flex-none" onClick={() => router.push(`${pathname}?action=trailer`, { scroll: false })}>
                        <PlayIcon />
                        Watch Trailer
                    </button>
                    {new Date(content.release_date) < new Date() &&
                        <button onClick={() => router.push(`${pathname}?action=rate`, { scroll: false })}>Already Watched?</button>
                    }
                    <button className="iconBtn">
                        <BookmarkIcon />
                    </button>
                </div>
            </section>
        </>
    )
}