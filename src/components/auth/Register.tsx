"use client";

import { LeftChevron } from "@assets/Icons";
import { DatePicker, Form, Input, Password, Poster, Textarea } from "@components/form";
import Choice from "@components/form/Choice";
import LinkInputManager from "@components/form/LinkInputManager";
import { genresToChoose } from "@lib/constants";
import { register } from "@lib/helpers/client";
import { isUsernameAvailable } from "@lib/helpers/common";
import { useCustomReducer } from "@lib/hooks";
import { registerUserSchemaClient, usernameSchema, userPrefrenceSchema } from "@lib/schemas";
import { convertCodeIntoError, readyFrames } from "@lib/utils";
import useCurrentUser from "@store/user";
import { InputManagerType } from "@type/other";
import { InputFrame, LinkSchema } from "@type/schemas";
import { profile } from "console";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

const Register = ({ email }: { email: string }) => {

    const {
        userData,
        username,
        page,
        setter,
    } = useCustomReducer({
        username: "",
        userData: null as any,
        page: 0,
    });

    const profileRef = useRef<InputManagerType<InputFrame>>(null);
    const linkRef = useRef<InputManagerType<LinkSchema[]>>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const router = useRouter();
    const { setUserHash } = useCurrentUser();
    const urlToRedirect = useSearchParams().get("url");

    const mainSubmit = async (data: any) => {
        router.prefetch(urlToRedirect ?? "/home");
        const { confirmPassword, ...restData } = userData;
        const dataToUpload = { ...restData, genres: data };

        const error = await register(dataToUpload, setUserHash);
        if (error) return error;
        router.replace(urlToRedirect ?? "/home");
    }

    const UserPrefrenceContainer = () => (
        <>
            <div className="mb-4">
                <div className="flex gap-4">
                    <button className="iconBtn my-auto" onClick={() => setter({ page: 1 })}>
                        <LeftChevron />
                    </button>
                    <h3 className="text-2xl text-center">Before we continue</h3>
                </div>
                <p className="mt-2 text-zinc-500 text-center">Choose 3-5 genres you like to watch</p>
            </div>
            <Form
                submit={mainSubmit}
                schema={userPrefrenceSchema}
                className="h-fit py-4">
                <div className="my-6 flex flex-wrap gap-3">
                    {genresToChoose.map(el => (
                        <Choice
                            label={el}
                            key={el}
                            name={el}
                            className="px-4 py-2 pointer border border-gray20 rounded-full has-[:checked]:border-orange-500"
                        />
                    ))}
                </div>
                <button className="primary w-full">Join The Popcorn Fun</button>
            </Form>
        </>

    )

    const storeUserData = async (data: any) => {
        const profile = profileRef.current?.getData();
        const { files, filesData } = await readyFrames(profile ? [profile] : []);
        const bioLinks = linkRef.current?.getData() ?? [];
        setter({ userData: { ...data, email, username, bioLinks, filesData, files }, page: 2 });
    }

    const UserDataContainer = () => (
        <>
            <div className="flex gap-4 mb-6">
                <button className="iconBtn my-auto" onClick={() => setter({ page: 0 })}>
                    <LeftChevron />
                </button>
                <h2 className="text-2xl text-center">Just few steps to go</h2>
                <button
                    className="primary w-full" type="submit"
                    onClick={() => formRef.current?.requestSubmit()}
                >Next</button>
            </div>

            <Poster ref={profileRef} />

            <Form
                ref={formRef}
                submit={storeUserData}
                schema={registerUserSchemaClient}
                className="space-y-4 mt-4"
            >
                <Input
                    type="text"
                    name="name"
                    placeholder="Display name"
                    autoFocus
                    defaultValue={userData?.name || ""}
                />
                <Textarea
                    maxLength={500}
                    name="bio"
                    placeholder="About Yourself"
                    defaultValue={userData?.bio || ""}
                />
                <DatePicker
                    type="date"
                    placeholder="Date of Birth"
                    name="dob"
                    defaultValue={userData ? new Date(userData.dob).toISOString().split("T")[0] : ""}
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
        </>
    )

    const checkUsernameAvailability = async (data: any) => {
        if (username && data.username.trim() === username) {
            setter({ page: 1 });
            return null;
        }

        const { errCode, result, success } = await isUsernameAvailable(data.username);
        if (!success) return convertCodeIntoError(errCode)
        else if (!result) return [{
            path: "username", message: "Username is not available"
        }]
        setter({ username: data.username, page: 1 });
    }

    const UsernameContainer = () => (
        <>
            <div className="mb-6">
                <h2 className="text-2xl text-center">Choose Username</h2>
                <p className="text-center text-sm text-zinc-500 mt-2">You can always change it later</p>
            </div>
            <Form schema={usernameSchema} submit={checkUsernameAvailability}>
                <Input
                    defaultValue={username}
                    name="username"
                    description="must be in lowercase without white spaces"
                    placeholder="Username"
                    autoFocus
                />
                <button className="primary w-full mt-6">Next</button>

            </Form>
        </>
    )

    const PageCont = () => {
        return page === 0 ? <UsernameContainer />
            : page === 1 ? <UserDataContainer />
                : <UserPrefrenceContainer />
    }

    return (
        <>
            <PageCont />
        </>
    )
}

export default Register;