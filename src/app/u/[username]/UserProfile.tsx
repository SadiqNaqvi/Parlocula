"use client";

import Tabs from "@components/Tabs";
import UserPost from "@app/u/[username]/tabs/UserPost";
import { getInternalPoster, numberConverter } from "@lib/utils";
import useCurrentUser from "@store/user";
import { User } from "@type/internal";

const UserProfile = ({ user, posts, page, filter }: { user: User, page: number, posts: any, filter: string, }) => {

    const currentUser = useCurrentUser().user;

    const userMeta = [
        { label: "followers", value: user.followers },
        { label: "following", value: user.following },
        { label: "posts", value: user.post_count }
    ]

    const { bio, name, username, profile } = user;

    const tabs = [
        { Label: "Posts", tab_id: "posts", Component: <UserPost username={username} postCount={user.post_count} filter={filter} initialData={posts} page={page} isCurrentUser={currentUser?.username === username} /> },
        { Label: "Comments", tab_id: "comments", Component: <UserPost username={username} postCount={user.post_count} filter={filter} initialData={posts} page={page} isCurrentUser={currentUser?.username === username} /> },
        { Label: "Lists", tab_id: "lists", Component: <UserPost username={username} postCount={user.post_count} filter={filter} initialData={posts} page={page} isCurrentUser={currentUser?.username === username} /> },
    ]


    return (
        <>
            <header>
                <section className="flex gap-6">
                    <div className="w-28">
                        <img className="size-full aspect-square rounded-full" src={getInternalPoster({ path: profile, options: { width: "112" } })} />
                    </div>
                    <div className="flex gap-3 my-auto">
                        {userMeta.map(({ label, value }) => (
                            <span className="p-2 space-y-2" key={label}>
                                <p className="text-2xl text-center">{numberConverter(value)}</p>
                                <p className="text-sm text-zinc-500">{label}</p>
                            </span>
                        ))}
                    </div>
                </section>
                <section className="mt-4">
                    <h2 className="text-2xl capitalize">{name}</h2>
                    <h1 className="text-sm mt-1">@{username}</h1>
                    <p className="text-sm mt-2 text-clamp-4">{bio}</p>
                    <div className="mt-4">
                        {currentUser?.username === username ?
                            <button className="primary">Edit Profile</button>
                            :
                            <button className="primary">Follow</button>

                        }
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