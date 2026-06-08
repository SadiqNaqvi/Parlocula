import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    pixelBasedPreset,
    Section,
    Tailwind,
    Text
} from '@react-email/components';

type Props = {
    warning: "first" | "second" | "last" | null,
    username: string,
    deleteOn: Date | string | number,
    userDocsCount: {
        followers: number;
        following: number;
        posts: number;
        comments: number;
        publicShelves: number;
        joinedThreads: number;
        createdThreads: number;
        reactions: number;
        likes: number;
        savedContents: number;
        rooms: number;
    }
}

const ThingsToLooseList = ({ count, description, heading, }: { heading: string, count: number | null, description: string }) => {
    if (count !== null && count < 1) return;

    return (
        <Section className='mt-2'>
            <Text className='font-semibold mb-1'>{heading}</Text>
            <Text className='m-0'>{description}</Text>
        </Section>
    )
}

const AccountDeletionWarning = ({ username, warning, deleteOn, userDocsCount }: Props) => {
    return (
        <Html>
            <Head />
            <Tailwind
                config={{
                    presets: [pixelBasedPreset],
                    theme: {
                        extend: {
                            colors: {
                                brand: "#007291",
                            },
                        },
                    },
                }}
            >
                <Body className="mx-auto my-auto bg-white px-2 font-sans">
                    <Container className="border border-zinc-500/30 p-5 mx-auto my-10 max-w-116.25 rounded-md">
                        <Section className="mt-8">
                            <Img
                                height={64}
                                width={64}
                                src="https://parlocula.vercel.app/icon-invert.png"
                                className="invert object-contain mx-auto"
                            />
                        </Section>

                        <Section className='m-0 p-0'>
                            <Heading className="mx-0 my-7 p-0 text-center font-normal text-2xl text-black">
                                Account Deletion Warning
                            </Heading>
                            <Text>
                                Hello @{username},
                            </Text>
                            <Text>
                                {warning ? `This is your ${warning} warning. ` : ''}
                                Your account on Parlocula has been requested to delete. If that was not you, you don{"'"}t have to panic, just login to Parlocula and the deletion would be canceled.
                            </Text>
                            <Text>
                                Your account is scheduled to be deleted on {new Date(deleteOn).toDateString()} but if you log-in before that, your account will be activated .
                            </Text>
                        </Section>

                        <Hr />

                        <Section>
                            <Text>Things you are about to loose</Text>
                            <ThingsToLooseList
                                heading={`${userDocsCount.followers} Followers`}
                                description="Yes! Everyone who loved you, followed you and supported you will be gone."
                                count={userDocsCount.followers}
                            />
                            <ThingsToLooseList
                                heading={`${userDocsCount.following} People you follow`}
                                description="You will loose everyone you once connected on Parlocula."
                                count={userDocsCount.following}
                            />
                            <ThingsToLooseList
                                heading={`${userDocsCount.posts} Posts`}
                                description="You will loose the access to all the Posts you have created and shared on Parlocula."
                                count={userDocsCount.posts}
                            />
                            <ThingsToLooseList
                                heading={`${userDocsCount.comments} Comments`}
                                description="You will loose access to all the discussions, theories, support, love and many other things you have created in the comment section."
                                count={userDocsCount.comments}
                            />
                            <ThingsToLooseList
                                heading={`${userDocsCount.publicShelves + 3} Shelves`}
                                description="You will loose all the shelves you have once created and shared with your friends. All the memories those shelves hold."
                                count={userDocsCount.publicShelves + 3}
                            />
                            <ThingsToLooseList
                                heading={`${userDocsCount.createdThreads} Created Threads`}
                                description="You will loose the ownership of all the threads created by you."
                                count={userDocsCount.createdThreads}
                            />
                            <ThingsToLooseList
                                heading={`${userDocsCount.joinedThreads} Joined Threads`}
                                description="You will loose the membership of all the threads joined by you."
                                count={userDocsCount.joinedThreads}
                            />
                            <ThingsToLooseList
                                heading={`${userDocsCount.rooms} Chats`}
                                description="You will loose all the chats you once made on Parlocula. All of the texts, emojis and memories once shared."
                                count={userDocsCount.rooms}
                            />
                            <ThingsToLooseList
                                heading={`${userDocsCount.savedContents} Saved Contents`}
                                description="You will loose all the contents (posts, comments and shelves) you have once saved on Parlocula."
                                count={userDocsCount.savedContents}
                            />
                            <ThingsToLooseList
                                heading={`${userDocsCount.reactions} Reactions`}
                                description="You will loose all the reactions once made on your posts."
                                count={userDocsCount.reactions}
                            />
                            <ThingsToLooseList
                                heading={`${userDocsCount.likes} Likes`}
                                description="You will loose all the likes your comments have once earned."
                                count={userDocsCount.likes}
                            />
                            <ThingsToLooseList
                                heading="And much more especially the memories you have created on Parlocula."
                                description="You are not the only one loosing things here, we are also loosing someone like you. We're gonna miss you."
                                count={null}
                            />
                        </Section>

                        <Hr />

                        <Section>
                            <Text className='text-sm'>
                                This email is sent to warn you that your account on Parloula is about to be deleted. You can always stop it by logging into Parlocula.
                            </Text>

                            <Link
                                className="mx-auto my-6 block py-2 text-zinc-50 text-center px-4 w-full max-w-24 bg-sky-500 rounded-md"
                                href={`/join`}>
                                Login
                            </Link>

                            <Text>
                                Reminder: Parlocula will never ask you to send us any of your details through email. Our emails are just to notify you with things, you should never reply to any emails sent under the name {'"'}Parlocula{'"'}.
                            </Text>
                        </Section>
                        <Text className='text-xs ghostColor text-center'>
                            This message was produced and distributed by Parlocula, a software application brought to you by Q-Core Technologies Pvt. Ltd. | All rights reserved.
                        </Text>
                    </Container>

                </Body>
            </Tailwind>
        </Html >
    );
}

export default AccountDeletionWarning;