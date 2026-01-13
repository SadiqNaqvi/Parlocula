"use client";

import { Form, Input, Poster, Textarea, DateInput, LinkInputManager } from "@components/form";
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
import z from "zod";
import ContentMockup from "./ContentMockup";
import { EditIcon } from "@assets/Icons";

const Register = ({ email }: { email: string }) => {

    const { username, page, dob, setter } = useCustomReducer({ username: "", page: 0, dob: undefined as Date | undefined });

    const profileRef = useRef<InputManagerType<InputFrame>>(null);
    const linkRef = useRef<InputManagerType<LinkSchema[]>>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const dobRef = useRef<{ get: () => Date | undefined }>(null);

    const navigation = useNavigation();
    const urlToRedirect = useSearchParams().get("url");

    const submit = async (data: { name: string, bio: string }) => {
        if (!dob) return "Date of birth is required";
        const profile = profileRef.current?.getData();

        const { files, filesData } = await readyFrames(profile ? [profile] : []);
        const bioLinks = linkRef.current?.getData() ?? [];

        const redirectTo = urlToRedirect && urlPattern.test(urlToRedirect) ? urlToRedirect : "/home";

        const error = await registerUserMutation({
            ...data,
            dob: dob.getTime(),
            email,
            username,
            bioLinks,
            filesData,
            files
        });

        if (error) return error;
        else if (error !== false)
            navigation.replace(redirectTo);
    }

    const storeDob = () => {
        const dob = dobRef.current?.get();
        if (dob) setter({ dob, page: 1 })
    }

    const checkUsernameAvailability = async (data: { username: string }) => {

        if (username && data.username.trim() === username)
            return setter({ page: 1 })

        const { errCode, result, success } = await isUsernameAvailable(data.username);

        if (!success) return codetoError(errCode);

        else if (!result) return [{ path: "username", message: "Username is not available" }]

        setter({ username: data.username, page: 2 });
    }

    if (page === 0) return (
        <>
            <Navbar className="p-0 !h-fit mt-4 sm:mt-0" navTitle="Create Account" />

            <div className="space-y-2 my-4">
                <label htmlFor="Date">Date of birth</label>
                <DateInput dateRef={dobRef} onComplete={storeDob} />
            </div>

            <button onClick={storeDob} className="primary w-full ">Next</button>
            <p className="text-center text-sm text-zinc-500 mt-2">DOB will not appear on your profile.</p>
        </>
    )

    else if (page === 1) return (
        <>
            <Navbar
                onGoBack={() => setter({ page: 0 })}
                className="p-0 !h-fit mt-4 sm:mt-0"
                navTitle="Create Account" />

            <Form
                className="mt-6 mb-3"
                schema={z.object({ username: usernameSchema })}
                submit={checkUsernameAvailability}>

                <Input
                data-testid="usernameInputBox"
                    defaultValue={username}
                    name="username"
                    description="Recommended: Use the name of your favourite character and sprinkle some numbers and an underscore in it."
                    placeholder="Username"
                    label="Choose a username"
                    autoFocus
                />

                <button type="submit" className="primary w-full mt-4">Next</button>

            </Form>
            <p className="text-center text-sm text-zinc-500 mt-2">You can change them later.</p>
        </>
    )

    return (
        <>

            <Navbar
                className="p-0 bg-primary !h-fit py-2 sm:pt-0"
                navTitle="Preview"
                onGoBack={() => setter({ page: 1 })}
                OptionButton={
                    <button
                        className="primary w-full sm:w-fit sm:mx-auto"
                        type="submit"
                        onClick={() => formRef.current?.requestSubmit()}
                    >
                        Join
                    </button>
                }
            />

            <p className="text-sm text-center text-zinc-500 my-4">Your profile looks like this. Click on a field to update your profile or skip it for later.</p>

            <section className="h-stretch">

                <Form
                    ref={formRef}
                    submit={submit}
                    schema={registerUserSchemaClient}
                    skipReset
                >

                    <div className="flex gap-4 mb-4 items-center">
                        <Poster className="size-28 min-w-28 m-0" ref={profileRef} />
                        <div className="space-y-1">
                            <div className="flex items-center gap-1">
                                <EditIcon className="text-zinc-500 size-5" />
                                <Input
                                    type="text"
                                    name="name"
                                    placeholder="Display name"
                                    autoFocus
                                    className="border-0 p-0 text-xl font-semibold"
                                />
                            </div>
                            <p className="font-semibold">@{username}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="space-x-[6px]">
                            <span className="font-semibold text-center text-lg">X</span>
                            <span className="">Posts</span>
                        </div>
                        <div className="space-x-[6px]">
                            <span className="font-semibold text-center text-lg">X</span>
                            <span className="">Followers</span>
                        </div>
                        <div className="space-x-[6px]">
                            <span className="font-semibold text-center text-lg">X</span>
                            <span className="">Following</span>
                        </div>
                    </div>

                    <div className="flex mt-4 gap-1 items-center">
                        <EditIcon className="text-zinc-500 size-4" />
                        <Textarea
                            maxLength={500}
                            name="bio"
                            placeholder="About Yourself"
                            containerClassName="flex-1 border-0 p-0"
                        />
                    </div>

                </Form>

                <div className="my-2">
                    <LinkInputManager ref={linkRef} />
                </div>

                <div className="mt-6 flex gap-2">
                    <div className="flex-1 bg-secondary color-primary rounded-md py-2 text-center">Follow</div>
                    <div className="flex-1 border-2 border-secondry rounded-md py-2 text-center">Message</div>
                </div>

                <ContentMockup />

            </section>
        </>
    )

}

export default Register;