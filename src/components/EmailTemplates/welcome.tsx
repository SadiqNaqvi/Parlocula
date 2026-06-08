import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    pixelBasedPreset,
    Preview,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';

const WelcomeEmail = ({ passkey }: { passkey: string }) => {

    return (
        <Html>
            <Head />
            <Preview>Welcome Aboard</Preview>
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
                    <Container className="border border-zinc-500/30 p-4 mx-auto my-10 max-w-116.25 rounded-md">
                        <Section className="mt-8">
                            <Img
                                src="https://parlocula.vercel.app/icon-invert.png"
                                width={64}
                                height={64}
                                alt="App Logo"
                                className="invert mx-auto object-contain"
                            />
                        </Section>
                        <Section className='p-0 m-0'>
                            <Heading className="mx-0 text-center my-7 p-0 font-normal text-2xl text-black">
                                Welcome To Parlocula
                            </Heading>
                            <Text>
                                Thanks for joining Parlocula. Take all the benefits of being a user over guests, like creating a thread, making posts, interacting with others using comment or direct message.
                            </Text>
                        </Section>
                        <Hr />
                        <Section className="m-0 p-0">
                            <Text className="font-semibold text-lg text-center">Your Passkey</Text>

                            <Text className='text-center'>{passkey}</Text>
                        </Section>
                        <Section className="mb-4">
                            <Text className='text-sm'>
                                You can use this passkey to update your information in future.
                            </Text>
                            <Text className='text-sm'>
                                Make sure to keep it safe somewhere and NEVER share this with anyone as it could get your account in trouble.
                            </Text>
                        </Section>
                        <Hr />
                        <Text className="text-xs text-center ghostColor">
                            This message was produced and distributed by Parlocula, an application of QCore Technologies Pvt. Ltd. | All rights reserved.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
};

export default WelcomeEmail;