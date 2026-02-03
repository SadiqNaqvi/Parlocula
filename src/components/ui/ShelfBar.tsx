import { Navigate } from "@components";
import { numberConverter } from "@lib/utils";
import { MereShelf } from "@type/internal";
import ShelfPoster from "./ShelfPoster";

const ShelfBar = ({ _id, item_count, name, poster, saved_count, shelfKey, isPrivate, shelf_type }: MereShelf) => {
    return (
        <Navigate key={_id} comp="link" goto={`/shelf/${_id}`}>
            <article className="flex items-center gap-3 py-2 px-4 border border-gray30 rounded-md">
                <ShelfPoster iconsClassName="p-2 bg-gray20" name={name} poster={poster} shelf_type={shelf_type} />

                <div>
                    <h4 className="line-clamp-1 capitalize">{name}</h4>
                    <ul className="flex gap-2 text-sm text-zinc-500">
                        {Boolean(item_count) && <li>Items: {numberConverter(item_count)}</li>}
                        {Boolean(saved_count) && <li>Saved by: {numberConverter(saved_count)}</li>}
                    </ul>
                </div>
            </article>
        </Navigate>
    )
}

export default ShelfBar;