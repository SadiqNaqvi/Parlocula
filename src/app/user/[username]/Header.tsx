"use client";

import { GenericWrapper, Navigate, FancyImage, ObserverHeader } from "@components";
import { getUserByUsername } from "@lib/helpers/common";
import { getQueryKeys, numberConverter } from "@lib/utils";
import useCurrentUser from "@store/user";
import { RequestedUser } from "@type/internal";
import { ActionButton, MessageButton } from "./";
import { OptionalChildren, InteractiveDetailSection, TabContainer, TabList, LinksSection, ParloImage } from "@components/ui";
import { HamburgerIcon } from "@assets/Icons";
import { UserPageSkeleton } from "@components/ui/loading";

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
            <HamburgerIcon />
        </Navigate>
    )

}

const Component = (data: RequestedUser, props: Props) => {

    const { _id, followers, following, posts, bio, name, username, profile, bioLinks, comments, publicShelves } = data;

    const userMeta = [
        { label: "followers", value: followers },
        { label: "following", value: following },
        { label: "posts", value: posts },
        // { label: "comments", value: comments },
        // { label: "shelves", value: publicShelves },
    ];

    return (
        <>
            <ObserverHeader
                titleToShare={`Check out @${username} on Parlocula`}
                className="mt-4 px-2 sm:px-4"
                OptionButton={<SettingButton uid={data._id} />}
                navTitle={username}>

                <section className="flex gap-4 items-center">
                    <ParloImage
                        prioritize
                        fancyGallery="profile_picture"
                        frameType="userProfile"
                        alt={`Profile picture of ${data.username}`}
                        size={112}
                        className="size-20 object-cover sm:size-28 max-h-fit aspect-square"
                        containerClassName="rounded-full"
                        classNameForFallback="p-2 sm:p-4 size-12 max-w-12 object-cover sm:size-20 sm:max-w-20"
                        frame={profile}
                        sizes={[
                            { maxScreenWidth: 480, imageWidth: 80 },
                            { imageWidth: 112 },
                        ]}
                    />
                    <div>
                        <OptionalChildren condition={name}>
                            <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold capitalize">{name}</h2>
                        </OptionalChildren>
                        <h1 data-observe className="text-sm mt-1">@{username}</h1>
                    </div>
                </section>
                <section className="mt-4">
                    <ul className="flex gap-3 overflow-x-auto">
                        {userMeta.map(({ label, value }) => (
                            <li className="gap-1 flex items-center text-nowrap" key={label}>
                                <span className="text-base">{numberConverter(value)}</span>
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
                    <ActionButton username={username} uid={props.uid} rid={_id} />
                    <MessageButton profile={profile} username={username} ruid={_id} />
                </section>
            </ObserverHeader>


            <TabContainer className="my-3">
                <TabList href={`/user/${username}`}>Posts</TabList>
                <TabList href={`/user/${username}/comments`}>Comments</TabList>
                <TabList href={`/user/${username}/shelves`}>Shelves</TabList>
            </TabContainer>
        </>
    )
}

const Header = (props: Props) => {

    return (
        <GenericWrapper
            loadingComponent={<UserPageSkeleton heading={props.username} />}
            component={Component}
            getQueryProps={getQueryProps}
            props={props}
        />
    )
}

export default Header;