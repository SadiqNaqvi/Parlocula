import Navigate from "@components/Navigate";
import { getPoster } from "@lib/dataRefiner";
import { ListItemType } from "@type/internal";
import Image from "next/image";

const ItemTile = ({ media_type, poster, title, tmdb_id, year, _id }: ListItemType) => (
    <article key={_id} className="w-full flex flex-cntr-between">
        <Navigate className="w-full" goto={`/explore/${media_type}/${tmdb_id}`} comp="link">
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
        </Navigate>
    </article>
)

export default ItemTile;