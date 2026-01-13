import Navigate from "@components/Navigate";
import { getPoster, numberConverter } from "@lib/utils";
import { MereShelf } from "@type/internal";
import Image from "next/image";

const ShelfBar = ({ _id, item_count, name, poster, saved_count, shelfKey, isPrivate }: MereShelf) => {
    return (
        <Navigate key={_id} comp="link" goto={`/shelf/${_id}`}>
            <article className="flex items-center gap-3 py-2 px-4 border border-gray30 rounded-md">

                <Image
                    className="size-[50px] object-cover"
                    height={50} width={50}
                    alt={`Poster of shelf ${name}`}
                    src={getPoster({ external: false, path: poster, type: "image" })}
                />

                <div>
                    <h4 className="line-clamp-1 capitalize">{name}</h4>
                    <ul className="flex gap-2">
                        {item_count && <li>Items: {numberConverter(item_count)}</li>}
                        {saved_count && <li>Saved by: {numberConverter(saved_count)}</li>}
                    </ul>
                </div>
            </article>
        </Navigate>
    )
}

export default ShelfBar;