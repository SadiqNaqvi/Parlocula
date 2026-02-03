"use client";

import { GenericWrapper, Navigate, FancyImage, ObserverHeader } from "@components";
import { getUserByUsername } from "@lib/helpers/common";
import { getQueryKeys, numberConverter } from "@lib/utils";
import useCurrentUser from "@store/user";
import { RequestedUser } from "@type/internal";
import { ActionButton, MessageButton } from "./";
import { OptionalChildren, InteractiveDetailSection, TabContainer, TabList, LinksSection, ParloImage } from "@components/ui";

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
        { label: "posts", value: posts },
        { label: "followers", value: followers },
        { label: "following", value: following },
    ];

    return (
        <>
            <ObserverHeader
                titleToShare={`Check out @${username} on Parlocula`}
                className="mt-4 px-2 sm:px-4"
                OptionButton={<SettingButton uid={data._id} />}
                navTitle={username}>

                <section className="flex gap-4 sm:flex-col items-center">
                    <ParloImage
                        fancy={{ gallery: "profile_picture" }}
                        alt={`Profile picture of ${data.username}`}
                        height={112}
                        width={112}
                        className="size-20 object-cover sm:size-28 max-h-fit aspect-square rounded-full"
                        frame={profile} />
                    <div>
                        <OptionalChildren condition={name}>
                            <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold capitalize">{name}</h2>
                        </OptionalChildren>
                        <h1 data-observe className="text-sm mt-1">@{username}</h1>
                    </div>
                </section>
                <section className="mt-4">
                    <ul className="flex gap-2">
                        {userMeta.map(({ label, value }) => (
                            <li className="gap-1 flex items-center" key={label}>
                                <span className="text-base sm:text-xl text-center">{numberConverter(value)}</span>
                                <span className="text-sm text-zinc-500">{label}</span>
                            </li>
                        ))}
                    </ul>

                    <InteractiveDetailSection className="text-sm my-2">{bio}</InteractiveDetailSection>

                    <OptionalChildren condition={bioLinks.length}>
                        <LinksSection links={bioLinks} />
                    </OptionalChildren>

                </section>
                <section className="mt-4 flex gap-2">
                    <ActionButton uid={props.uid} rid={_id} />
                    <MessageButton profile={profile} username={username} ruid={_id} />
                </section>
            </ObserverHeader>


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