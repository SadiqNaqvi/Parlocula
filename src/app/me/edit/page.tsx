"use client";

import { Navbar } from "@components";
import { DatePicker, Form, Input, Poster, Textarea } from "@components/form";
import LinkInputManager from "@components/form/LinkInputManager";
import { LoadingSpinner } from "@components/ui";
import { updateUser } from "@lib/helpers/client";
import { getQueryClient } from "@lib/queryClient";
import { registerUserSchemaClient } from "@lib/schemas";
import { getPoster, readyFrames } from "@lib/utils";
import useCurrentUser from "@store/user";
import { InputManagerType } from "@type/other";
import { InputFrame, RegisterSchemaClientType } from "@type/schemas";
import { useRef } from "react";

const Page = () => {

    const { user, isHydrated, setUserHash } = useCurrentUser();
    const linkRef = useRef<InputManagerType>(null);
    const profileRef = useRef<InputManagerType<InputFrame>>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const queryClient = getQueryClient();

    if (!isHydrated) return <LoadingSpinner />
    // else if (!user) router.replace("/me");
    else if (!user) return null;

    const userProfile = user.profile ? getPoster({ external: false, type: "image", path: user?.profile }) : undefined;

    const submit = async (data: RegisterSchemaClientType) => {
        const bioLinks = linkRef.current?.getData();
        const profile = profileRef.current?.getData();
        const { bio, dob, name } = data;

        let profileUpdate: Record<string, any> | null = null;

        // Check if current profile is same as the default one? if yes then leave it.
        if (profile?.path !== userProfile) {
            // If user had a profile, it is likely removed or changed now. Hence remove the old file from the media host.
            if (user.profile) profileUpdate = { filesToRemove: [{ type: "image", path: user.profile }] };

            // If user have chosen a new profile, upload it on the media host.
            if (profile) profileUpdate = { ...profileUpdate, ...(await readyFrames([profile])) }
        }

        const update = Object({
            ...(bio !== user.bio && { bio }),
            ...(new Date(dob).getTime() !== new Date(user.dob).getTime() && { dob }),
            ...(name !== user.name && { name }),
            ...(profileUpdate),
            ...(JSON.stringify(bioLinks) !== JSON.stringify(user.bioLinks) && { bioLinks })
        });

        return await updateUser(user._id, update, setUserHash, queryClient, user.username);
    }

    const defaultVal = {
        name: user.name,
        bio: user.bio,
        dob: new Date(user.dob).toISOString().split('T').at(0)
    }

    return (
        <>
            <header className="flex flex-cntr-between">
                <Navbar navTitle="Edit Profile" />
                <button onClick={() => formRef.current?.requestSubmit()} className="primary w-full sm:w-fit" type="submit">Save</button>
            </header>

            <section>
                <Poster ref={profileRef} defaultPoster={userProfile} />

                <Form
                    ref={formRef}
                    submit={submit}
                    schema={registerUserSchemaClient}
                    defaultVals={defaultVal}
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
                </Form>
                <div className="mt-4">
                    <LinkInputManager defaultLinks={user.bioLinks} ref={linkRef} />
                </div>
            </section>
        </>
    )

}

export default Page;