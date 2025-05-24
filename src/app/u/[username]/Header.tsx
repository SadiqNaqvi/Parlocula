"use client";

import { GenericWrapper } from "@components";
import FancyImage from "@components/FancyImage";
import ObserverHeader from "@components/ObserverHeader";
import InteractiveDetailSection from "@components/ui/InteractiveDetailSection";
import { TabContainer, TabList } from "@components/ui/Tabs";
import { getUserByUsername } from "@lib/helpers/common";
import { getInternalPoster, getQueryKeys, numberConverter } from "@lib/utils";
import { RequestedUser } from "@type/internal";
import { usePathname } from "next/navigation";
import ActionButton from "./ActionButton";

type Props = { username: string, children: React.ReactNode };

const getQueryProps = ({ username }: Props) => ({
    queryKeys: getQueryKeys("user_username", { username }),
    queryFn: getUserByUsername,
    args: [username],
})

const Header = (props: Props) => {
    const pathname = usePathname();

    const component = (data: RequestedUser, { children }: Props) => {

        const segment = pathname.split('/').at(-1);
        const tab = segment === "comments" || segment === "lists" ? segment : "posts";

        const { _id, followers, following, posts, bio, name, username, profile, bioLinks } = data;

        const userMeta = [
            { label: "followers", value: followers },
            { label: "following", value: following },
            { label: "posts", value: posts }
        ];

        return (
            <>
                <ObserverHeader
                    titleToShare={`Check out @${username} on Popcorn Paragon`}
                    headerClasses="mt-4"
                    navTitle={username}>
                    <section className="flex gap-6">
                        <div>
                            <FancyImage
                                alt={`Profile picture of ${data.username}`}
                                height={112}
                                width={112}
                                id="profile_picture"
                                className="size-28 aspect-square rounded-full" src={getInternalPoster({ path: profile, options: { width: "112" } })} />
                        </div>
                        <div className="flex gap-2 sm:gap-3 my-auto">
                            {userMeta.map(({ label, value }) => (
                                <span className="gap-2 flex flex-col sm:flex-row itemx-center" key={label}>
                                    <span className="text-2xl text-center">{numberConverter(value)}</span>
                                    <span className="text-sm text-zinc-500">{label}</span>
                                </span>
                            ))}
                        </div>
                    </section>
                    <section className="mt-4">
                        <h2 className="text-2xl capitalize">{name}</h2>
                        <h1 data-observe className="text-sm mt-1">@ {username}</h1>
                        <InteractiveDetailSection className="text-sm mt-2 text-clamp-4">{bio}</InteractiveDetailSection>
                        <div className="mt-4">
                            <ActionButton rid={_id} />
                        </div>
                    </section>
                </ObserverHeader>

                <TabContainer className="my-3">
                    <TabList href={`/u/${username}`} isActive={tab === "posts"}>Posts</TabList>
                    <TabList href={`/u/${username}/comments`} isActive={tab === "comments"}>Comments</TabList>
                    <TabList href={`/u/${username}/lists`} isActive={tab === "lists"}>Lists</TabList>
                </TabContainer>

                {children}
            </>
        )
    }

    return <GenericWrapper component={component} getQueryProps={getQueryProps} props={props} />
}

export default Header;