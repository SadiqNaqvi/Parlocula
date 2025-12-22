"use client";

import { Navbar } from "@components";
import { DatePicker, Form, Input, LinkInputManager, Poster, Textarea } from "@components/form";
import { LoadingSpinner } from "@components/ui";
import { updateUser } from "@lib/helpers/mutations";
import { registerUserSchemaClient } from "@lib/schemas";
import { checkEditedFields, readyFrames } from "@lib/utils";
import { useNavigation } from "@store/historystack";
import useCurrentUser from "@store/user";
import { InputManagerType } from "@type/other";
import { InputFrame, RegisterSchemaClientType } from "@type/schemas";
import { useRef } from "react";

const Page = () => {

    const { user, isHydrated } = useCurrentUser();
    const linkRef = useRef<InputManagerType>(null);
    const profileRef = useRef<InputManagerType<InputFrame>>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const navigation = useNavigation();


    if (!isHydrated) return <LoadingSpinner />
    else if (!user) return null;

    const userProfile = user?.profile;

    const defaultVal = {
        name: user.name,
        bio: user.bio,
        dob: new Date(user.dob).toISOString().split('T')[0],
    }

    const submit = async (data: RegisterSchemaClientType) => {
        const bioLinks = linkRef.current?.getData();
        const profile = profileRef.current?.getData();

        const editedFields = checkEditedFields(
            { ...defaultVal, bioLinks: user.bioLinks, dob: new Date(defaultVal.dob).getTime() },
            { ...data, bioLinks }
        );

        let profileUpdate = {};

        // Check if current profile is same as the default one? if yes then leave it.
        if (profile?.path !== userProfile?.path) {

            // If user had a profile, it is likely removed or changed now. Hence remove the old file from the media host.
            if (user.profile) profileUpdate = { filesToRemove: [{ type: "image", path: user.profile }] };

            // If user have chosen a new profile, upload it on the media host.
            if (profile) profileUpdate = { ...profileUpdate, ...(await readyFrames([profile])) }
        }

        const fieldsToUpdate = { ...editedFields, ...profileUpdate };

        if (!Object.keys(fieldsToUpdate).length) return;

        const error = await updateUser(fieldsToUpdate);
        if (error) return error;
        navigation.goto(`/user/${user.username}`);
    }

    const requestSubmit = () => formRef.current?.requestSubmit()

    return (
        <>
            <Navbar navTitle="Edit Profile"
                OptionButton={
                    <button onClick={requestSubmit} className="primary w-full sm:w-fit" type="submit">Save</button>
                }
            />

            <section>
                <Poster ref={profileRef} defaultPoster={userProfile?.path} />

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