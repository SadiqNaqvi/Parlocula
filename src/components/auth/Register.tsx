"use client";

import { EditIcon, LeftChevron } from "@assets/Icons";
import { DatePicker, Form, Input, Password, Textarea } from "@components/form";
import Choice from "@components/form/Choice";
import MediaInputCont from "@components/MediaInputCont";
import OptionMenu from "@components/OptionMenu";
import { isUsernameAvailable } from "@lib/actions";
import { genresToChoose } from "@lib/constants";
import { useCustomReducer } from "@lib/hooks";
import { registerUserSchemaClient, registerUserSchemaServer, usernameSchema, userPrefrenceSchema } from "@lib/schemas";
import { objectToFormData, refineZodError } from "@lib/utils";
import useCurrentUser from "@store/user";
import { User } from "@type/internal";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

const Register = ({ email }: { email: string }) => {

    const {
        blob,
        profile,
        userData,
        username,
        page,
        setter,
    } = useCustomReducer<{
        username: string,
        userData: any,
        blob: Blob | null,
        page: number,
        profile: string
    }>({
        username: "",
        blob: null,
        profile: '',
        userData: null,
        page: 0,
    });
    const router = useRouter();
    const { setUserHash } = useCurrentUser();
    const urlToRedirect = useSearchParams().get("url");

    const storeUserAndRedirect = (user: User) => {
        setUserHash(user);
        router.replace(urlToRedirect ?? "/home");
    }

    const getProfilePicture = (file: Blob | string) => {
        setter({ profile: "", blob: null });
        if (typeof file === "string")
            setter({ profile: file });
        else
            setter({ blob: file, profile: URL.createObjectURL(file) });
    }

    const mainSubmit = async (data: any) => {
        const { confirmPassword, ...restData } = userData;
        const dataToUpload = { ...restData, genres: data };

        const resp: { data: { result: any, success: boolean, error: any } } = await axios.post(
            `/api/register`,
            objectToFormData(dataToUpload)
        );

        const { result, success, error } = resp.data;
        if (!success) {
            if (typeof error !== "string")
                return refineZodError(error)
            return [{ path: "custom", message: error }]
        };
        storeUserAndRedirect(result);
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
        const file_type = profile ? "image" : null;
        const file = blob ? new File([new Uint8Array(await blob.arrayBuffer())], "Popcorn Paragon", { type: "image/webp" }) : null;
        const file_url = profile || null;
        console.log(data);
        setter({ userData: { ...data, email, username, file_type, file, file_url }, page: 2 });
    }

    const UserDataContainer = () => (
        <>
            <div className="flex gap-4 mb-6">
                <button className="iconBtn my-auto" onClick={() => setter({ page: 0 })}>
                    <LeftChevron />
                </button>
                <h2 className="text-2xl text-center">Just few steps to go</h2>
            </div>
            <div className="group size-48 mx-auto relative">
                <div className="size-full absolute z-[1] rounded-full border border-dashed border-slate-500 group-has-[img]:backdrop-brightness-50 group-has-[img]:text-slate-50">
                    {profile ?
                        <OptionMenu ButtonElement={<EditIcon />} className="size-full smallBtn flex flex-cntr-all" controls="auto" place="end">
                            <li className="w-full border-b border-gray30">
                                <button className="w-full p-3 smallBtn text-left" popoverTarget="profile-picker">
                                    Change Picture
                                </button>
                            </li>
                            <li className="w-full border-b border-gray30">
                                <button className="w-full p-3 smallBtn text-left" onClick={() => setter({ profile: "", blob: null })}>
                                    Remove Picture
                                </button>
                            </li>
                        </OptionMenu>
                        :
                        <button
                            popoverTarget="profile-picker"
                            className="smallBtn rounded-full flex flex-cntr-all size-full">
                            <EditIcon />
                        </button>
                    }
                </div>
                {profile &&
                    <img
                        src={profile}
                        alt=""
                        className="size-full rounded-full object-cover"
                    />
                }
            </div>
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

        const resp = await isUsernameAvailable(data.username)
        if (!resp.success) return [{
            path: "custom", message: resp.error
        }]
        if (!resp.result) return [{
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