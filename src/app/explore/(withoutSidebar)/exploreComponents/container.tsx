import { BookmarkIcon, LinkIcon } from "@assets/Icons";
import { ContentBox } from "@components";
import { getPoster, refineString } from "@lib/dataRefiner";
import Image from "next/image";
import Link from "next/link";
import Navbar from "./Navbar";

export default function Container({ children, metadata, content }: { children: React.ReactNode, metadata: any[], content: any }) {

    // const menuOptions = [
    //     {
    //         icon: StarIcon,
    //         label: "Mark as Favourite",
    //         func: () => { console.log("click hua") },
    //     },
    //     {
    //         icon: HeartIcon,
    //         label: "Add to Suggestion",
    //         func: () => { }
    //     },
    //     {
    //         icon: BookmarkIcon,
    //         label: "Add to Watchlist",
    //         func: () => { }
    //     },
    //     {
    //         icon: PlaylistIcon,
    //         label: "Add to Playlist",
    //         func: () => { }
    //     },
    //     {
    //         icon: ThreadIcon,
    //         label: "Visit Thread",
    //         func: () => { }
    //     },
    //     {
    //         icon: CollectionIcon,
    //         label: "Visit Collection",
    //         func: () => { }
    //     },
    //     {
    //         icon: EditIcon,
    //         label: "Edit page",
    //         func: () => { }
    //     },
    // ]

    return (
        <>
            <Navbar />
            <main className="h-fit pt-20 pb-6 md:flex px-6 gap-6">
                <div className="fixed z-[-1] bg-fixed inset-0 background-all brightness-[0.25] blur-sm" style={content.backdrop ? { backgroundImage: `url(${getPoster("backdrop", content.backdrop, 1)})` } : undefined}></div>

                <section className="sticky top-[6rem] w-64 h-fit space-y-4">
                    <Image src={getPoster("poster", content.poster, 4)} className="aspect-[2/3] w-full object-cover rounded-lg" alt="" width={1000} height={1000} />

                    <div className="grid gap-2 grid-cols-2">
                        {metadata.map(el => (
                            <span key={el.label} className="border text-center text-nowrap border-[var(--gray20)] py-3 rounded-md">{el.value}
                                <span className="text-sm ml-2 text-zinc-500">{el.label}</span>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <button className="secondary flex-1">Watch Trailer</button>
                        <button className="iconBtn"><BookmarkIcon /></button>
                        {content.homepage &&
                            <Link href={content.homepage} className="p-2"><LinkIcon /></Link>
                        }
                    </div>
                </section>

                <section style={{ "--calcWidth": "18rem" } as React.CSSProperties} className="calcWidth">
                    <h1 className="text-7xl uppercase font-semibold">{content.title}</h1>
                    {content.tagline && <p className="text-zinc-500">{content.tagline}</p>}
                    {content.genres &&
                        <div className="mt-6 space-x-4">
                            {content.genres.slice(0, 3).map((el: any) => (
                                <Link role="button" href={`/explore/genres/${refineString(el).toLowerCase()}`} key={el} className="px-4 py-2 bg-[var(--gray20)] rounded-md">{el}</Link>
                            ))}
                        </div>
                    }
                    <p className="my-3 text-zinc-500">{content.overview}</p>
                    <div className="mb-6 space-y-3">
                        <h2 className="text-xl uppercase font-semibold">Top Cast</h2>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {content.cast.map((el: any) => (
                                <ContentBox key={el.id} title={el.name} detail={el.character} img={el.poster} link={`/explore/person/${el.id}-${refineString(el.name)}`} />
                            ))}
                        </div>
                    </div>
                    {children}
                </section>
            </main >
        </>
    )
}