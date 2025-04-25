"use client";

import { LeftChevron } from "@assets/Icons";
import { DatePicker, Form, Input, Password, Poster, Textarea } from "@components/form";
import Choice from "@components/form/Choice";
import MediaInputCont from "@components/MediaInputCont";
import { isUsernameAvailable, register } from "@lib/helpers/client";
import { genresToChoose } from "@lib/constants";
import { useCustomReducer } from "@lib/hooks";
import { registerUserSchemaClient, usernameSchema, userPrefrenceSchema } from "@lib/schemas";
import { convertCodeIntoError } from "@lib/utils";
import useCurrentUser from "@store/user";
import { InputFrame } from "@type/internal";
import { useRouter, useSearchParams } from "next/navigation";

const Register = ({ email }: { email: string }) => {

    const {
        profile,
        userData,
        username,
        page,
        setter,
    } = useCustomReducer<{
        username: string,
        userData: any,
        page: number,
        profile: InputFrame | null
    }>({
        username: "",
        profile: null,
        userData: null,
        page: 0,
    });
    const router = useRouter();
    const { setUserHash } = useCurrentUser();
    const urlToRedirect = useSearchParams().get("url");

    const getProfilePicture = (profile: InputFrame[]) => {
        setter({ profile: profile.pop() });
    }

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
        const file = profile && !profile.isExternal ? new File(
            [new Uint8Array(await profile.blob.arrayBuffer())],
            `Profile Picture of ${data.name} thread - Popcorn Paragon`,
            { type: "image/webp" })
            : null;

        const fileData = profile ? { url: profile.url, isExternal: profile.isExternal, type: profile.type } : null
        setter({ userData: { ...data, email, username, fileData, file, }, page: 2 });
    }

    const UserDataContainer = () => (
        <>
            <div className="flex gap-4 mb-6">
                <button className="iconBtn my-auto" onClick={() => setter({ page: 0 })}>
                    <LeftChevron />
                </button>
                <h2 className="text-2xl text-center">Just few steps to go</h2>
            </div>
            <Poster picture={profile?.url || ""} removePicture={() => setter({ profile: null })} />
            <Form
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
                <Password
                    name="password"
                    placeholder="Password"
                    defaultValue={userData?.password || ""}
                />
                <Password
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    defaultValue={userData?.confirmPassword || ""}
                />
                {/* <input
                    className="px-3 py-2 border border-gray30 rounded-md text-lg bg-transparent w-full"
                    type="date"
                    name="dob"
                    id=""
                    placeholder="Date of Birth"
                /> */}
                <button className="primary w-full" type="submit">Next</button>
            </Form>
            <MediaInputCont callback={getProfilePicture} type="image" popover="auto" id="profile-picker" />
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