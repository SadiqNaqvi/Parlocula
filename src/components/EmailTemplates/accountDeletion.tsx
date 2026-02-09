import { parloculaAppURL } from '@lib/constants';
import { numberConverter } from '@lib/utils';
import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text
} from '@react-email/components';
import { GenericDate } from '@type/internal';
import { CSSProperties } from 'react';
import { app_production_url } from '@lib/constants';

const logo = new URL("/apple-touch-icon.png", app_production_url).href;
type Props = {
    warning: "first" | "second" | "last" | null,
    username: string,
    deleteOn: GenericDate,
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
        <Section style={{ marginInline: "8px" }}>
            <Text style={h3}>{heading}</Text>
            <Text style={{ ...footerText, marginTop: "4px" }}>{description}</Text>
        </Section>
    )
}

const AccountDeletionWarning = ({ username, warning, deleteOn, userDocsCount }: Props) => (
    <Html>
        <Head />
        <Body style={main}>
            <Preview>Your account on Parlocula has been requested to delete.</Preview>
            <Container style={container}>
                <Section style={coverSection}>

                    <Section style={header}>
                        <Img
                            src={logo}
                            width="75"
                            height="75"
                            alt="App Logo"
                        />
                    </Section>

                    <Section style={upperSection}>
                        <Heading style={h1}>Account Deletion Warning</Heading>
                        <Text style={mainText}>
                            Hello @{username}, {warning ? `This is your ${warning} warning. ` : ''}
                            Your account on Parlocula has been requested to delete. If that was not you, you don{"'"}t have to panic, just login to Parlocula and the deletion would be canceled.
                            Your account is scheduled to be deleted on {new Date(deleteOn).toDateString()} but if you log-in before that, your account will be activated .
                        </Text>
                    </Section>

                    <Hr />

                    <Section>
                        <Text style={h2}>Things you are about to loose</Text>
                        <ThingsToLooseList
                            heading={`${numberConverter(userDocsCount.followers)} Followers`}
                            description="Yes! Everyone who loved you, followed you and supported you will be gone."
                            count={userDocsCount.followers}
                        />
                        <ThingsToLooseList
                            heading={`${numberConverter(userDocsCount.following)} People you follow`}
                            description="You will loose everyone you once connected on Parlocula."
                            count={userDocsCount.following}
                        />
                        <ThingsToLooseList
                            heading={`${numberConverter(userDocsCount.posts)} Posts`}
                            description="You will loose the access to all the Posts you have created and shared on Parlocula."
                            count={userDocsCount.posts}
                        />
                        <ThingsToLooseList
                            heading={`${numberConverter(userDocsCount.comments)} Comments`}
                            description="You will loose access to all the discussions, theories, support, love and many other things you have created in the comment section."
                            count={userDocsCount.comments}
                        />
                        <ThingsToLooseList
                            heading={`${numberConverter(userDocsCount.publicShelves + 3)} Shelves`}
                            description="You will loose all the shelves you have once created and shared with your friends. All the memories those shelves hold."
                            count={userDocsCount.publicShelves + 3}
                        />
                        <ThingsToLooseList
                            heading={`${numberConverter(userDocsCount.createdThreads)} Created Threads`}
                            description="You will loose the ownership of all the threads created by you."
                            count={userDocsCount.createdThreads}
                        />
                        <ThingsToLooseList
                            heading={`${numberConverter(userDocsCount.joinedThreads)} Joined Threads`}
                            description="You will loose the membership of all the threads joined by you."
                            count={userDocsCount.joinedThreads}
                        />
                        <ThingsToLooseList
                            heading={`${numberConverter(userDocsCount.rooms)} Chats`}
                            description="You will loose all the chats you once made on Parlocula. All of the texts, emojis and memories once shared."
                            count={userDocsCount.rooms}
                        />
                        <ThingsToLooseList
                            heading={`${numberConverter(userDocsCount.savedContents)} Saved Contents`}
                            description="You will loose all the contents (posts, comments and shelves) you have once saved on Parlocula."
                            count={userDocsCount.savedContents}
                        />
                        <ThingsToLooseList
                            heading={`${numberConverter(userDocsCount.reactions)} Reactions`}
                            description="You will loose all the reactions once made on your posts."
                            count={userDocsCount.reactions}
                        />
                        <ThingsToLooseList
                            heading={`${numberConverter(userDocsCount.likes)} Likes`}
                            description="You will loose all the likes your comments have once earned."
                            count={userDocsCount.likes}
                        />
                        <ThingsToLooseList
                            heading="And much more especially the memories you have created on Parlocula."
                            description="You are not the only one loosing things here, we are also loosing someone like you. We miss you already."
                            count={null}
                        />
                    </Section>

                    <Hr />

                    <Section style={lowerSection}>
                        <Text style={cautionText}>
                            This email is sent to warn you that your account on Parloula is about to be deleted. You can always stop it by logging into Parlocula.
                        </Text>

                        <Link
                            style={ActionButtonPrimary}
                            href={`${parloculaAppURL}/join`}>
                            Login
                        </Link>

                        <Text style={{ ...text, marginTop: "8px" }}>
                            Reminder: Parlocula will never ask you to send us any of your details through email. Our emails are just to notify you with things, you should never reply to any emails sent under the name {'"'}Parlocula{'"'}.
                        </Text>
                    </Section>

                </Section>

                <Text style={footerText}>
                    This message was produced and distributed by Parlocula, a software application brought to you by Q-Core Technologies Pvt. Ltd. | All rights reserved.
                </Text>

            </Container>
        </Body>
    </Html>
);

const main = {
    backgroundColor: '#fff',
    color: '#212121',
};

const container = {
    padding: '20px 10px',
    backgroundColor: '#eee',
};

const alignText = { textAlign: 'center' } as Record<string, CanvasTextAlign>;

const heading = {
    ...alignText,
    color: '#333',
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontWeight: 'bold',
}

const h1 = {
    ...heading,
    fontSize: '20px',
    marginBottom: '15px',
};

const h2 = {
    ...h1,
    fontSize: '18px',
};

const h3 = {
    ...h1,
    fontSize: '14px',
    textTransform: "uppercase",
} as CSSProperties;

const text = {
    ...alignText,
    color: '#333',
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: '14px',
    margin: '24px 0',
};

const header = {
    backgroundColor: '#0f111f',
    display: 'flex',
    padding: '15px 0',
    alignItems: 'center',
    justifyContent: 'center',
};

const coverSection = { backgroundColor: '#fff' };

const upperSection = { padding: '25px 15px' };

const lowerSection: CSSProperties = {
    padding: '25px 15px',
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px"
};

const ActionButtonPrimary: CSSProperties = {
    paddingInline: "8px",
    paddingBlock: "4px",
    width: "100%",
    maxWidth: "320px",
    marginInline: "auto",
}

const footerText = {
    ...text,
    fontSize: '12px',
};

const mainText = { ...text, marginBottom: '14px' };

const cautionText = { ...text, margin: '0px' };

export default AccountDeletionWarning;