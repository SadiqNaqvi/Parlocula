import UserPost from "@components/UserPost"
import placeholder from "@assets/placeholder.png"
import Tabs from "@components/Tabs"
import { User } from "@type/internal"

const UserProfile = ({ user, isCurrentUser }: { user: User, isCurrentUser?: boolean }) => {
    const userMeta = [
        { label: "followers", value: user.followers },
        { label: "following", value: user.following },
        { label: "posts", value: user.post_count }
    ]

    const tabs = [
        { Label: "Posts", Component: <UserPost uid={"lala"} postCount={user.post_count} isCurrentUser={isCurrentUser ?? false} /> },
        { Label: "Comments", Component: <UserPost uid={"lala"} postCount={user.post_count} isCurrentUser={isCurrentUser ?? false} /> },
        { Label: "Lists", Component: <UserPost uid={"lala"} postCount={user.post_count} isCurrentUser={isCurrentUser ?? false} /> },
    ]
    return (
        <>
            <header className="">
                <section className="flex gap-6">
                    <div className="w-28">
                        <img className="size-full aspect-square rounded-full" src={user.profile || placeholder.src} />
                    </div>
                    <div className="flex gap-3 my-auto">
                        {userMeta.map(({ label, value }) => (
                            <span className="p-2 space-y-2" key={label}>
                                <p className="text-2xl text-center">{value}</p>
                                <p className="text-sm text-zinc-500">{label}</p>
                            </span>
                        ))}
                    </div>
                </section>
                <section className="mt-4">
                    <h1 className="text-xl">{user.username}</h1>
                    <p className="text-sm mt-1 text-clamp-4">{user.bio}</p>
                    <div className="mt-4">
                        <button className="primary">Edit Profile</button>
                    </div>
                </section>
            </header>
            <section className="mt-6">
                <Tabs tabs={tabs} />
            </section>
        </>
    )
}

export default UserProfile;