"use client";

import { DatePicker, Form, Input, Poster, Textarea } from "@components/form";
import LinkInputManager from "@components/form/LinkInputManager";
import Navbar from "@components/Navbar";
import { urlPattern } from "@lib/constants";
import { isUsernameAvailable } from "@lib/helpers/common";
import { registerUserMutation } from "@lib/helpers/mutations";
import { useCustomReducer } from "@lib/hooks";
import { registerUserSchemaClient, usernameSchema } from "@lib/schemas";
import { codetoError, readyFrames } from "@lib/utils";
import { useNavigation } from "@store/historystack";
import { InputManagerType } from "@type/other";
import { InputFrame, LinkSchema } from "@type/schemas";
import { useSearchParams } from "next/navigation";
import { useRef } from "react";

const Register = ({ email }: { email: string }) => {

    const { username, page, setter } = useCustomReducer({ username: "", page: 0 });

    const profileRef = useRef<InputManagerType<InputFrame>>(null);
    const linkRef = useRef<InputManagerType<LinkSchema[]>>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const navigation = useNavigation();
    const urlToRedirect = useSearchParams().get("url");

    const submit = async (data: { name: string, bio: string, dob: string }) => {

        const profile = profileRef.current?.getData();

        const { files, filesData } = await readyFrames(profile ? [profile] : []);
        const bioLinks = linkRef.current?.getData() ?? [];

        const redirectTo = urlToRedirect && urlPattern.test(urlToRedirect) ? urlToRedirect : "/home";

        const error = await registerUserMutation({
            ...data,
            dob: new Date(data.dob).getTime(),
            email,
            username,
            bioLinks,
            filesData,
            files
        });

        if (error) return error;

        navigation.replace(redirectTo);
    }

    const checkUsernameAvailability = async (data: { username: string }) => {

        if (username && data.username.trim() === username)
            return setter({ page: 1 })

        const { errCode, result, success } = await isUsernameAvailable(data.username);

        if (!success) return codetoError(errCode)

        else if (!result) return [{ path: "username", message: "Username is not available" }]

        setter({ username: data.username, page: 1 });
    }

    if (page === 0) return (
        <>
            <Navbar />

            <div className="mb-6">
                <h2 className="text-2xl text-center">Choose Username</h2>
                <p className="text-center text-sm text-zinc-500 mt-2">You can always change it later</p>
            </div>

            <Form
                className="h-size-screen"
                schema={usernameSchema}
                submit={checkUsernameAvailability}>

                <Input
                    defaultValue={username}
                    name="username"
                    description="must be in lowercase without white spaces"
                    placeholder="Username"
                    autoFocus
                />

                <button type="submit" className="primary w-full mt-auto">Next</button>

            </Form>
        </>
    )

    return (
        <div className="h-size-screen">

            <Navbar onGoBack={() => setter({ page: 0 })} />

            <section className="h-stretch">

                <Poster className="my-6" ref={profileRef} />

                <Form
                    ref={formRef}
                    submit={submit}
                    schema={registerUserSchemaClient}
                    className="space-y-4"
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

                    {/* <input
                    className="px-3 py-2 border border-gray30 rounded-md text-lg bg-transparent w-full"
                    type="date"
                    name="dob"
                    id=""
                    placeholder="Date of Birth"
                /> */}
                </Form>
                <LinkInputManager ref={linkRef} />

            </section>

            <footer>

                <button
                    className="primary w-full sm:w-fit sm:mx-auto"
                    type="submit"
                    onClick={() => formRef.current?.requestSubmit()}
                >
                    Next
                </button>

            </footer>

        </div>
    )

}

export default Register;