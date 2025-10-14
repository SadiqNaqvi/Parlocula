import Navigate from "@components/Navigate";
import { getPoster } from "@lib/utils";
import Image from "next/image";

export const UserBar = ({ profile, username }: { profile: string | undefined, username: string }) => (
    <article className="flex items-center gap-3 py-2 px-4 border border-gray30 rounded-md">
        <Image
            className="size-[50px] object-cover"
            height={50}
            width={50}
            alt={`Profile picture of ${username}`}
            src={getPoster({ path: profile })} />
        <h5 className="line-clamp-1">{username}</h5>
    </article>
)

const UserTile = ({ profile, username }: { username: string, profile: string | undefined }) => {
    return (
        <Navigate comp="link" goto={`/u/${username}`}>
            <UserBar username={username} profile={profile} />
        </Navigate>
    )
}

export default UserTile;