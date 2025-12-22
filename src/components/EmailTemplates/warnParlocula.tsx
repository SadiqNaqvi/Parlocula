import { parloculaAppURL } from '@lib/constants';
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
import { CSSProperties } from 'react';

type Props = {
    title: string,
    desc: string,
    path: string,
}

const WarnTeamParlocula = ({ desc, path, title }: Props) => (
    <Html>
        <Head />
        <Body style={main}>
            <Preview>Warning From Parlocula</Preview>
            <Container style={container}>
                <Section style={coverSection}>

                    <Section style={header}>
                        <Img
                            src={`${parloculaAppURL}/logo.jpg`}
                            width="75"
                            height="75"
                            alt="App Logo"
                        />
                    </Section>

                    <Section style={upperSection}>
                        <Heading style={h1}>{title}</Heading>
                        <Text style={mainText}>{desc}</Text>
                    </Section>

                    <Section>
                        <Text style={text}>Here is the attached Link</Text>
                        <Link href={path} style={{ color: 'lightblue', marginTop: "16px" }}>{path}</Link>
                    </Section>

                    <Hr />

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

export default WarnTeamParlocula;