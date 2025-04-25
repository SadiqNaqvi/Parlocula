import Navigate from "@components/Navigate";
import { getInternalPoster, numberConverter } from "@lib/utils";
import { MereList } from "@type/internal";
import Image from "next/image";

const ListTile = ({ _id, item_count, name, poster, saved_count }: MereList) => {
    return (
        <Navigate comp="link" goto={`/l/${_id}`}>
            <article className="flex items-center gap-3 py-2 px-4 border border-gray30 rounded-md">
                <Image className="size-[50px] object-cover" height={50} width={50} alt={`Poster of list ${name}`} src={getInternalPoster({ path: poster, options: { height: "50", width: "50", crop: "fill" } })} />
                <div>
                    <h4 className="line-clamp-1">{name}</h4>
                    <ul className="flex gap-2">
                        <li>Items: {numberConverter(item_count)}</li>
                        <li>Saved by: {numberConverter(saved_count)}</li>
                    </ul>
                </div>
            </article>
        </Navigate>
    )
}

export default ListTile;