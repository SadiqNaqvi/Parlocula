import Navigate from "@components/Navigate";
import { getPoster } from "@lib/utils";
import { ShelfItemType } from "@type/internal";
import Image from "next/image";

type ContentOnlyProps = Pick<ShelfItemType, "poster" | "title" | "year">;

const ShelfItemContent = ({ poster, title, year }: ContentOnlyProps) => (
    <article className="flex items-center gap-3 w-full">
        <Image
            width={64}
            height={64}
            src={getPoster({ external: true, type: "poster", path: poster, size: "w92" })}
            alt={`Poster for ${title}`}
            className="size-12 sm:size-16 object-cover object-center rounded-full"
        />
        <div className="space-y-2">
            <h3 className="font-semibold sm:text-xl">{title}</h3>
            <span className="text-sm text-zinc-500">{year}</span>
        </div>
    </article>
)

export const ShowOnlyShelfItem = ShelfItemContent;

const ShelfItemBar = ({ cinement_type, poster, title, ext_id, year, _id }: ShelfItemType) => (
    <Navigate className="w-full" goto={`/explore/${cinement_type}/${ext_id}`} comp="link">
        <ShelfItemContent poster={poster} title={title} year={year} />
    </Navigate>
)

export default ShelfItemBar;