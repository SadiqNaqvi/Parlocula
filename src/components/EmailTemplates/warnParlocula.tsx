// import { parloculaAppURL } from "../constant";
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
    title: string,
    desc: string,
    path: string,
}

const WarnTeamParlocula = ({ desc, path, title }: Props) => (
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

                    <Section>
                        <Heading className="mx-0 my-7 p-0 text-center font-normal text-2xl text-black">
                            {title}
                        </Heading>
                        <Text>{desc}</Text>
                    </Section>

                    <Section>
                        <Text>Here is the attached Link</Text>
                        <Link href={path}>{path}</Link>
                    </Section>

                    <Hr />

                    <Text>
                        This message was produced and distributed by Parlocula, a software application brought to you by Q-Core Technologies Pvt. Ltd. | All rights reserved.
                    </Text>

                </Container>
            </Body>
        </Tailwind>
    </Html>
);

export default WarnTeamParlocula;