import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    pixelBasedPreset,
    Section,
    Tailwind,
    Text
} from '@react-email/components';

const AccountDeleted = ({ username }: { username: string }) => (
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

                    <Section className='m-0 p-0'>
                        <Heading className="mx-0 my-7 p-0 text-center font-normal text-2xl text-black">
                            Parlocula Account Deleted
                        </Heading>
                        <Text>
                            Hello @{username},
                        </Text>
                        <Text>
                            Your account on Parlocula has been deleted. Thank you for using Parlocula, we are going to miss you.
                        </Text>
                        <Text>
                            You can always come back and create a new account, but always remember we love you and you are a part of our family.
                        </Text>
                    </Section>

                    <Hr />

                    <Text className="text-sm">
                        Reminder: Parlocula will never ask you to send us any of your details through email. Our emails are just to notify you with things, you should never reply to any emails sent under the name {'"'}Parlocula{'"'}.
                    </Text>

                    <Hr />

                    <Text className='text-xs text-center ghostColor'>
                        This message was produced and distributed by Parlocula, a software application brought to you by Q-Core Technologies Pvt. Ltd. | All rights reserved.
                    </Text>

                </Container>
            </Body>
        </Tailwind>
    </Html>
);

export default AccountDeleted;