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
import { app_production_url } from '@lib/constants';

const logo = new URL("/apple-touch-icon", app_production_url).href;

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
                            alt="App Logo"
                        />
                    </Section>
                    <Section style={upperSection}>
                        <Heading style={h1}>Verify your email address</Heading>
                        <Text style={mainText}>
                            Hello It{"'"}s your Parlocula 👋. We want to make sure it{"'"}s really you. Please enter the following
                            verification code when prompted. If you haven{"'"}t requested for this, you can safely ignore this email.
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
                            Parlocula will never email you and ask you to disclose or verify your password, credit card, or banking account number.
                        </Text>
                    </Section>
                </Section>
                <Text style={footerText}>
                    This message was produced and distributed by Parlocula, a software application of Q-Core Technologies Pvt. Ltd. | All rights reserved.
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

const h1 = {
    ...alignText,
    color: '#333',
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
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
    width: "100%",
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