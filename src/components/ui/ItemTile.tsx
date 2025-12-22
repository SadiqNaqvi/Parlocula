import Navigate from "@components/Navigate";
import { getPoster } from "@lib/utils";
import { ShelfItemType } from "@type/internal";
import Image from "next/image";

const ShelfItemBar = ({ cinement_id, poster, title, ext_id, year, _id }: ShelfItemType) => (
    <article key={_id} className="w-full flex flex-cntr-between">
        <Navigate className="w-full" goto={`/explore/${cinement_id}/${ext_id}`} comp="link">
            <div className="flex items-center gap-3 w-full">
                <Image
                    width={64}
                    height={64}
                    src={getPoster({ external: true, type: "poster", path: poster, size: "w92" })}
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

export default ShelfItemBar;