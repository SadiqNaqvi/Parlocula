"use client";

import { GenericWrapper } from "@components";
import FancyImage from "@components/FancyImage";
import ObserverHeader from "@components/ObserverHeader";
import InteractiveDetailSection from "@components/ui/InteractiveDetailSection";
import { TabContainer, TabList } from "@components/ui/Tabs";
import { getUserByUsername } from "@lib/helpers/common";
import { getPoster, getQueryKeys, numberConverter } from "@lib/utils";
import { RequestedUser } from "@type/internal";
import ActionButton from "./ActionButton";
import { getQueryClient } from "@lib/queryClient";
import MessageButton from "./MessageButton";

type Props = { username: string, uid: string | undefined };

const getQueryProps = ({ username }: Props) => ({
    queryKeys: getQueryKeys("user_username", { username }),
    queryFn: getUserByUsername,
    args: [username],
})

const Header = (props: Props) => {
    const queryClient = getQueryClient();

    const component = (data: RequestedUser) => {

        const room = props.uid ? queryClient.getQueryData<{ _id: string }>(getQueryKeys("roomExists_ruid_uid", { ruid: data._id, uid: props.uid })) : undefined;
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
                    headerClasses="mt-4 px-4"
                    navTitle={username}>
                    <section className="flex gap-6 sm:flex-col">
                        <div>
                            <FancyImage
                                alt={`Profile picture of ${data.username}`}
                                height={112}
                                width={112}
                                id="profile_picture"
                                className="size-20 object-cover sm:size-28 max-h-fit aspect-square rounded-full" src={getPoster({ path: profile })} />
                        </div>
                        <div className="flex gap-2 sm:gap-3 my-auto">
                            {userMeta.map(({ label, value }) => (
                                <span className="gap-2 flex flex-col sm:flex-row items-center" key={label}>
                                    <span className="text-base sm:text-xl text-center">{numberConverter(value)}</span>
                                    <span className="text-sm text-zinc-500">{label}</span>
                                </span>
                            ))}
                        </div>
                    </section>
                    <section className="mt-4">
                        <h2 className="text-2xl capitalize">{name}</h2>
                        <h1 data-observe className="text-sm mt-1">@{username}</h1>
                        <InteractiveDetailSection className="text-sm mt-2 text-clamp-4">{bio}</InteractiveDetailSection>
                        <div className="mt-4 flex">
                            <ActionButton uid={props.uid} rid={_id} />
                            <MessageButton profile={profile} username={username} ruid={_id} />
                        </div>
                    </section>
                </ObserverHeader>

                <TabContainer className="my-3">
                    <TabList href={`/u/${username}`}>Posts</TabList>
                    <TabList href={`/u/${username}/comments`}>Comments</TabList>
                    <TabList href={`/u/${username}/lists`}>Lists</TabList>
                </TabContainer>
            </>
        )
    }

    return <GenericWrapper component={component} getQueryProps={getQueryProps} props={props} />
}

export default Header;