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

const VerifyEmail = ({ code }: { code: number }) => (
    <Html>
        <Head />
        <Body style={main}>
            <Preview>Email Verification</Preview>
            <Container style={container}>
                <Section style={coverSection}>
                    <Section style={header}>
                        <Img
                            src={logo}
                            width="75"
                            height="75"
                            alt="App's Logo"
                        />
                    </Section>
                    <Section style={upperSection}>
                        <Heading style={h1}>Verify your email address</Heading>
                        <Text style={mainText}>
                            Thanks for starting the joining process of Popcorn Paragon. We
                            want to make sure it's really you. Please enter the following
                            verification code when prompted. If you haven't requested for this email, you can safely ignore this message.
                        </Text>
                        <Section style={verificationSection}>
                            <Text style={verifyText}>Verification code</Text>

                            <Text style={codeText}>{code}</Text>
                            <Text style={validityText}>
                                (This code is valid for 5 minutes)
                            </Text>
                        </Section>
                    </Section>
                    <Hr />
                    <Section style={lowerSection}>
                        <Text style={cautionText}>
                            Popcorn Paragon will never email you and ask you to disclose
                            or verify your password, credit card, or banking account number.
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

const appName = {
    color: "#f5f5fa",
    fontSize: "1rem"
}

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
    padding: '15px 0',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: '36px',
    margin: '10px 0',
    textAlign: 'center' as const,
};

const validityText = {
    ...text,
    margin: '0px',
    textAlign: 'center' as const,
};

const verificationSection = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const mainText = { ...text, marginBottom: '14px' };

const cautionText = { ...text, margin: '0px' };

export default VerifyEmail;