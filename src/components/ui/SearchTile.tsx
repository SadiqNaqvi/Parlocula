import { getPoster } from "@lib/dataRefiner";
import { RefinedSearchData } from "@lib/types";
import Navigate from "../Navigate";

export const LoadingSearchTile = () => (
    <>
        <li className="w-full flex gap-2 md:gap-4">
            <div className="w-16 md:w-20 aspect-[2/3] rounded-md skeletonLoading"></div>
            <div className="flex-1 space-y-4">
                <div className="w-[80%] h-4 rounded-md skeletonLoading"></div>
                <div className="w-[40%] h-4 rounded-md skeletonLoading"></div>
            </div>
        </li>
        <li className="w-full flex gap-2 md:gap-4">
            <div className="w-16 md:w-20 aspect-square rounded-full skeletonLoading"></div>
            <div className="flex-1 space-y-4">
                <div className="w-[80%] h-4 rounded-md skeletonLoading"></div>
                <div className="w-[40%] h-4 rounded-md skeletonLoading"></div>
            </div>
        </li>
    </>
)

export default function SearchTile({ id, image, media_type, name }: RefinedSearchData) {

    const mediaFilter: Record<string, string> = { "movie": "poster", "tv": "poster", "show": "poster", "collection": "poster", "company": "logo", "person": "profile" };

    return <li className="w-full">
        <Navigate comp="link" className="h-full w-full flex gap-2 md:gap-4" goto={`/explore/${media_type === "tv" ? "show" : media_type}/${id}-${name.replaceAll(' ', '-')}`}>
            <img src={getPoster(mediaFilter[media_type], image, 1)} className={`w-16 md:w-20 object-center ${media_type === "person" ? "aspect-square rounded-full object-cover" : media_type === "company" ? "aspect-video object-contain" : "aspect-[2/3] rounded-md object-cover"}`} alt="" />
            <div className="flex-1 space-y-4">
                <h2 className="text-xl font-semibold">{name}</h2>
                <span className="mt-auto text-sm capitalize">{media_type === "tv" ? "show" : media_type}</span>
            </div>
        </Navigate>
    </li>
}