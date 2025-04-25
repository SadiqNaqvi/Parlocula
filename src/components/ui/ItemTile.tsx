import { CheckBoxIcon, Ellipsis, EmptyBoxIcon } from "@assets/Icons";
import Navigate from "@components/Navigate";
import { getPoster } from "@lib/dataRefiner";
import { MediaItemType } from "@type/internal";
import Image from "next/image";

type MetadataProps = { title: string, year: number, poster: string }

const ItemMetadata = ({ poster, title, year }: MetadataProps) => {
    return (
        <div className="flex items-center gap-3 w-full">
            <Image
                width={100}
                height={100}
                src={getPoster("poster", poster, 5)}
                alt={`Poster for ${title}`}
                className="size-16 object-cover object-center rounded-full"
            />
            <div className="space-y-2">
                <h3 className="font-semibold text-xl">{title}</h3>
                <span className="text-sm text-zinc-500">{year}</span>
            </div>
        </div>
    )
}

export const ItemCheckTile = ({ _id, title, year, poster }: MetadataProps & { _id: string }) => (
    <label htmlFor={_id} className="pointer w-full flex flex-cntr-between">
        <input type="checkbox" name={_id} id={_id} className="sr-only peer" />
        <ItemMetadata title={title} poster={poster} year={year} />
        <CheckBoxIcon classnames="hidden peer-checked:block" />
        <EmptyBoxIcon classnames="block peer-checked:hidden" />
    </label>
)

const ItemTile = ({ media_type, poster, title, tmdb_id, year }: MediaItemType) => (
    <article className="w-full flex flex-cntr-between">
        <Navigate className="w-full" goto={`/explore/${media_type}/${tmdb_id}`} comp="link">
            <ItemMetadata title={title} poster={poster} year={year} />
        </Navigate>
        <button className="mx-4 my-auto"><Ellipsis /></button>
    </article>
)

export default ItemTile;