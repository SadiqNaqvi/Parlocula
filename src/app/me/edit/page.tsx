"use client";

import { Navbar } from "@components";
import Register from "@components/auth/Register";
import { DatePicker, Form, Input, Password, Poster, Textarea } from "@components/form";
import { LoadingSpinner } from "@components/ui";
import { useCustomReducer } from "@lib/hooks";
import { registerUserSchemaClient } from "@lib/schemas";
import useCurrentUser from "@store/user";
import { Link } from "@type/internal";
import { InputFrame } from "@type/schemas";
import { useRouter } from "next/navigation";

const Page = () => {

    const router = useRouter();
    const { user, isHydrated } = useCurrentUser();
    const { profile, links, setter } = useCustomReducer({
        profile: [] as InputFrame[],
        links: [] as Link[],
    });

    if (!isHydrated) return <LoadingSpinner />
    else if (!user) router.replace("/me");

    const getProfilePicture = (profile: InputFrame[]) => {
        setter({ profile });
    }

    const submit = (data: any) => {
        console.log(submit);
    }

    return (
        <>
            <Navbar navTitle="Edit Profile" />
            <section>
                <Poster defaultPoster={user?.profile} getImage={getProfilePicture} removePicture={() => setter({ profile: [] })} />

                <Form
                    submit={submit}
                    defaultVals={user}
                    schema={registerUserSchemaClient}
                    className="space-y-4 mt-4"
                >
                    <Input
                        type="text"
                        name="name"
                        placeholder="Display name"
                        autoFocus
                    />
                    <Textarea
                        maxLength={500}
                        name="bio"
                        placeholder="About Yourself"
                    />
                    <DatePicker
                        type="date"
                        placeholder="Date of Birth"
                        name="dob"
                    />
                    <button className="primary" type="submit">Save</button>
                </Form>
            </section>
        </>
    )

}

export default Page;