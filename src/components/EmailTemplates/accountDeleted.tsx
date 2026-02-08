import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text
} from '@react-email/components';
import { CSSProperties } from 'react';
import { app_production_url } from '@lib/constants';

const logo = new URL("/apple-touch-icon", app_production_url).href;

const AccountDeleted = ({ username }: { username: string }) => (
    <Html>
        <Head />
        <Body style={main}>
            <Preview>Your account on Parlocula has been deleted.</Preview>
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
                        <Heading style={h1}>Parlocula Account Deleted</Heading>
                        <Text style={mainText}>
                            Hello @{username}, Your account on Parlocula has been deleted. Thank you for using Parlocula, we are going to miss you.
                            You can always come back and create a new account, but always remember we love you and you are a part of our family.
                        </Text>
                    </Section>

                    <Hr />

                    <Text style={text}>
                        Reminder: Parlocula will never ask you to send us any of your details through email. Our emails are just to notify you with things, you should never reply to any emails sent under the name {'"'}Parlocula{'"'}.
                    </Text>
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

const footerText = {
    ...text,
    fontSize: '12px',
};

const mainText = { ...text, marginBottom: '14px' };

export default AccountDeleted;