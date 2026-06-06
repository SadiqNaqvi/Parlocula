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
    Preview,
    Section,
    Tailwind,
    Text
} from '@react-email/components';

type Props = {
    page: string,
    desc: string,
    user: { username: string, email: string, id: string },
    type: "report" | "suggestion"
}

const BugOrSuggestionTemplate = ({ desc, user, page, type }: Props) => (
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
            <Preview>A {type} from Parlocula</Preview>
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
                            A {type} from Parlocula at page: {page}
                        </Heading>
                        <Text>{desc}</Text>
                    </Section>

                    <Section>
                        <Text className="text-xl font-semibold">User Data</Text>
                        <Text>Username: {user.username}</Text>
                        <Text>email: {user.email}</Text>
                        <Text>id: {user.id}</Text>
                    </Section>

                </Container>
            </Body>
        </Tailwind>
    </Html>
);

export default BugOrSuggestionTemplate;