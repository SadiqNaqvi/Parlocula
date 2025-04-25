import Navigate from "@components/Navigate";
import { getInternalPoster } from "@lib/utils";
import Image from "next/image";

const UserTile = ({ profile, username }: { username: string, profile: string }) => {
    return (
        <Navigate comp="link" goto={`/u/${username}`}>
            <article className="flex items-center gap-3 py-2 px-4 border border-gray30 rounded-md">
                <Image className="size-[50px] object-cover" height={50} width={50} alt={`Profile picture of ${username}`} src={getInternalPoster({ path: profile, options: { height: "50", width: "50", crop: "fill" } })} />
                <h4 className="line-clamp-1">{username}</h4>
            </article>
        </Navigate>
    )
}

export default UserTile;