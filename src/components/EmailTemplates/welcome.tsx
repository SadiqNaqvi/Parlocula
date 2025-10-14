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

const logo = "https://lh3.googleusercontent.com/pw/AP1GczN_I3g2XWyPglqNU7GkYnroLYUNTDUyw65s4_6xleNch1O8jO9ItoA-88Wq9NG9l7jUCLlcynt44KIEQnucFHGNgtQDwZokwo9AvtSljHdQaZ_NZK8=w494-h492-no";

const WelcomeEmail = ({ passkey }: { passkey: string }) => (
    <Html>
        <Head />
        <Body style={main}>
            {/* <Preview>Welcome Aboard</Preview> */}
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
                        <Heading style={h1}>Welcome To Popcorn Paragon</Heading>
                        <Text style={mainText}>
                            Thanks for joining Popcorn Paragon. Take all the benefits of being a user over guests, like creating a thread, making posts, interacting with others using comment or direct message.
                        </Text>
                        <Section style={verificationSection}>
                            <Text style={verifyText}>Your Passkey</Text>

                            <Text style={codeText}>{passkey}</Text>
                        </Section>
                    </Section>
                    <Hr />
                    <Section style={lowerSection}>
                        <Text style={cautionText}>
                            You can use this passkey to update your information in future.
                            Make sure to keep it safe somewhere and NEVER share this with anyone or we{"'"}re not responsible for your account.
                        </Text>
                    </Section>
                </Section>
                <Text style={footerText}>
                    This message was produced and distributed by Popcorn Paragon, an application of QCore Technologies Pvt. Ltd. | All rights reserved.
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

const h1 = {
    color: '#333',
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
};

const text = {
    color: '#333',
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: '14px',
    margin: '24px 0',
};

const header = {
    backgroundColor: '#0f111f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '15px 0',
};

const coverSection = { backgroundColor: '#fff' };

const upperSection = { padding: '25px 15px' };

const lowerSection = { padding: '25px 15px' };

const footerText = {
    ...text,
    fontSize: '12px',
};

const verifyText = {
    ...text,
    margin: 0,
    fontWeight: 'bold',
    textAlign: 'center' as const,
};

const codeText = {
    ...text,
    fontWeight: 'bold',
    fontSize: '24px',
    margin: '10px 0',
    textAlign: 'center' as const,
};

const verificationSection = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: "20px 0",
};

const mainText = { ...text, marginBottom: '14px' };

const cautionText = { ...text, margin: '0px' };

export default WelcomeEmail;