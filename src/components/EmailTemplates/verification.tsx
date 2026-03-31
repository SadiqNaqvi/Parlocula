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
    Text
} from '@react-email/components';

const VerifyEmail = ({ code }: { code: number }) => (
    <Html>
        <Head />
        <Preview>Email Verification</Preview>
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
                            Verify your email address
                        </Heading>
                        <Text className="text-black leading-6">
                            Hello dear user,
                        </Text>
                        <Text className="text-black leading-6">
                            We want to make sure it{"'"}s really you. Please enter the following
                            verification code when prompted. If you haven{"'"}t requested for this, you can safely ignore this email.
                        </Text>
                    </Section>
                    <Section className='m-0 p-0'>
                        {/* <Text className='font-semibold text-center text-lg'>Verification code</Text> */}

                        <Text className='text-center font-semibold text-3xl mb-2'>{code}</Text>
                        <Text className='text-center text-zinc-500 mt-0'>
                            (This code is valid for 5 minutes)
                        </Text>
                    </Section>
                    <Hr />
                    <Section>
                        <Text className='text-sm text-center mb-0'>
                            Parlocula will never email you and ask you to disclose or verify your password, credit card, or banking account number.
                        </Text>
                    </Section>
                    <Text className='text-center text-sm text-zinc-500 mb-0'>
                        This message was produced and distributed by Parlocula, a software application of Q-Core Technologies Pvt. Ltd. | All rights reserved.
                    </Text>
                </Container>
            </Body>
        </Tailwind>
    </Html>
);

export default VerifyEmail;