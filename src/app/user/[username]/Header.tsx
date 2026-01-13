"use client";

import { GenericWrapper, Navigate } from "@components";
import FancyImage from "@components/FancyImage";
import ObserverHeader from "@components/ObserverHeader";
import InteractiveDetailSection from "@components/ui/InteractiveDetailSection";
import LinksSection from "@components/ui/LinksSection";
import { TabContainer, TabList } from "@components/ui/Tabs";
import { getUserByUsername } from "@lib/helpers/common";
import { getQueryKeys, numberConverter } from "@lib/utils";
import useCurrentUser from "@store/user";
import { RequestedUser } from "@type/internal";
import ActionButton from "./ActionButton";
import MessageButton from "./MessageButton";
import { OptionalChildren } from "@components/ui";

type Props = { username: string, uid: string | undefined };

const getQueryProps = ({ username }: Props) => ({
    queryKeys: getQueryKeys("user_username", { username }),
    queryFn: getUserByUsername,
    args: [username],
});

const SettingButton = ({ uid }: { uid: string }) => {

    const { meta } = useCurrentUser();

    if (!meta || meta.user_id !== uid) return;

    return (
        <Navigate comp="link" goto="/settings" type="button">
            ⚙
        </Navigate>
    )

}

const Component = (data: RequestedUser, props: Props) => {

    const { _id, followers, following, posts, bio, name, username, profile, bioLinks, comments, publicShelves } = data;

    const userMeta = [
        { label: "followers", value: followers },
        { label: "following", value: following },
        { label: "posts", value: posts }
    ];

    return (
        <>
            <ObserverHeader
                titleToShare={`Check out @${username} on Parlocula`}
                headerClasses="mt-4 px-4"
                OptionButton={<SettingButton uid={data._id} />}
                navTitle={username}>

                <section className="flex gap-6 sm:flex-col">
                    <div>
                        <FancyImage
                            alt={`Profile picture of ${data.username}`}
                            height={112}
                            width={112}
                            id="profile_picture"
                            className="size-20 object-cover sm:size-28 max-h-fit aspect-square rounded-full"
                            src={profile} />
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

                    <OptionalChildren condition={name}>
                        <h2 className="text-2xl capitalize">{name}</h2>
                    </OptionalChildren>
                    <h1 data-observe className="text-sm mt-1">@{username}</h1>

                    <InteractiveDetailSection className="text-sm mt-2 text-clamp-4">{bio}</InteractiveDetailSection>

                    <div className="mt-4 flex">
                        <ActionButton uid={props.uid} rid={_id} />
                        <MessageButton profile={profile} username={username} ruid={_id} />
                    </div>

                </section>
            </ObserverHeader>

            <LinksSection links={bioLinks} />

            <TabContainer className="my-3">
                <TabList href={`/user/${username}`}>Posts ( {posts || 0} ) </TabList>
                <TabList href={`/user/${username}/comments`}>Comments ( {comments || 0} ) </TabList>
                <TabList href={`/user/${username}/shelves`}>Shelves ( {publicShelves || 0} ) </TabList>
            </TabContainer>
        </>
    )
}

const Header = (props: Props) => {

    return <GenericWrapper
        component={Component}
        getQueryProps={getQueryProps}
        props={props}
    />
}

export default Header;