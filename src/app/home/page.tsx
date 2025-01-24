import { DataFetcher, Sidebar } from "@components"
import { FrameTile, NotFound, ShowError } from "@components/ui"
import Link from "next/link"

export default async function Home() {

    const frames = [
        { spoiler: false },
        { spoiler: true },
        { spoiler: false },
        { spoiler: true },
        { spoiler: false },
        { spoiler: true },
        { spoiler: false },
        { spoiler: true },
    ]

    return (
        <>
            <header className="h-dvh flex flex-cntr-all flex-col">
                <h1 className="text-5xl text-center font-normal mb-4">Stop Searching Start Watching with <br /> Popcorn Paragon</h1>
                <p className="text-md text-gray-500">Let AI search movies for you based on your taste!</p>
                <Link href="/generate" role="button" className="py-3 px-6 bg-[var(--secondary)] text-[var(--secondaryText)] mt-8 rounded-md">Generate</Link>
            </header>
            <section className="grid grid-cols-4 gap-2">
                {frames.map((frame, ind) => (
                    <FrameTile key={ind} spoiler={frame.spoiler} />
                ))}
            </section>
            {/* <section className="my-4 px-4 space-y-4">
                    <div className="flex flex-cntr-between">
                        <h3 className="text-2xl uppercase font-semibold">Popular Movies</h3>
                        <Link href={`/explore/trending/movies`}>More</Link>
                    </div>
                    <DataFetcher classnames="flex overflow-x-auto gap-4 pb-2" url={`/api/data/movies?s=popularity`} />
                </section> */}
        </>
    )
}