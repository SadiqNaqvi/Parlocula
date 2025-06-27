import Navigate from "@components/Navigate";
import { getPoster, numberConverter } from "@lib/utils";
import { MereList } from "@type/internal";
import { UsersListType } from "@type/other";
import Image from "next/image";
import ListIcons from "./ListIconMap";

const getListHref = (id: string) => {
    switch (id) {
        case "saved": return "/me/saved/lists";
        case "private": return "/l/private";
        default: return `/l/${id}`;
    }
}

export const UsersListTile = ({ name, _id, poster }: { name: UsersListType, _id: string, poster?: string }) => (
    <Navigate key={_id} comp="link" goto={getListHref(_id)}>
        <article className="flex items-center gap-3 py-2 px-4 border border-gray30 rounded-md">
            {poster ?
                <Image className="size-[50px] object-cover" height={50} width={50} alt={`Poster of list ${name}`} src={getPoster({ external: true, type: "poster", path: poster, size: "w92" })} />
                :
                <div className="size-[50px] rounded-full bg-gray20 flex flex-cntr-all">
                    <ListIcons type={_id} />
                </div>
            }
            <h4 className="line-clamp-1 capitalize">{name}</h4>
        </article>
    </Navigate>
)

const ListTile = ({ _id, item_count, name, poster, saved_count }: MereList) => {
    return (
        <Navigate key={_id} comp="link" goto={`/l/${_id}`}>
            <article className="flex items-center gap-3 py-2 px-4 border border-gray30 rounded-md">
                <Image className="size-[50px] object-cover" height={50} width={50} alt={`Poster of list ${name}`} src={getPoster({ external: false, path: poster, type: "image" })} />
                <div>
                    <h4 className="line-clamp-1 capitalize">{name}</h4>
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