import Navigate from "@components/Navigate";
import { MereUser } from "@type/internal";
import ParloImage from "./ParloImage";

export const SimpleUserBar = ({ profile, username }: MereUser) => (
    <article className="flex items-center gap-3 py-2 px-4 border border-gray30 rounded-md">
        <ParloImage
            frameType="userProfile"
            className="object-cover"
            size={50}
            alt={`Profile picture of ${username}`}
            frame={profile}
        />
        <h5 className="line-clamp-1">{username}</h5>
    </article>
)

const UserBar = ({ profile, username, _id }: MereUser) => {
    return (
        <Navigate comp="link" goto={`/user/${username}`}>
            <SimpleUserBar username={username} profile={profile} _id={_id} />
        </Navigate>
    )
}

export default UserBar;