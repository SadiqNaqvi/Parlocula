import { getPoster } from "@lib/dataRefiner"
import Navigate from "../Navigate";

export const VerticleMovieCardSkeleton = () => (
    <div className="min-w-40 w-40 aspect-[2/3] space-y-2">
        <div className="w-full aspect-[2/3] skeletonLoading"></div>
        <div className="space-y-2">
            <div className="w-[90%] rounded-3xl h-2 skeletonLoading"></div>
            <div className="w-[40%] rounded-3xl h-2 skeletonLoading"></div>
        </div>
    </div>
)

type props = { link: string, poster: string, title: string, year: string };

export default function VerticleMovieCard({ link, poster, title, year }: props) {
    return (
        <Navigate comp="link" goto={link}>
            <figure className="min-w-44 w-44 relative cursor-pointer">
                <img src={getPoster("poster", poster, 2)} loading="lazy" alt='' className="w-full aspect-[2/3] object-cover" />
                <figcaption className="absolute *:px-2 inset-0 fade-effect flex flex-col justify-end">
                    <h3 className="font-bold line-clamp-2 text-wrap">{title}</h3>
                    <div className="flex flex-cntr-between my-1">
                        <span className="text-xs">{year}</span>
                        <span className="text-xs px-2 py-1 rounded-md bg-gray40">8.6</span>
                    </div>
                </figcaption>
            </figure>
        </Navigate>
    )
}