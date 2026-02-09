import MetadataTile, { MetadataTileContainer } from "@components/ui/MetaDataTile"
import { UserPageMockup } from "@components/ui/mockup"
import { registerUserSchemaClient } from "@lib/schemas"
import { InputManagerType } from "@type/other"
import { InputFrame, LinkSchema, RegisterSchemaClientType, UserSchemaType } from "@type/schemas"
import { RefObject, useRef } from "react"
import { DisplayNameInput, TextAreaInput } from "."
import Form from "../Form"
import LinkInputManager from "../LinkInputManager"
import Poster from "../Poster"
import { OptionalChildren } from "@components/ui"
import { CurrentUser } from "@type/internal"
import { checkEditedFields, readyFrames } from "@lib/utils"
import { parloculaAppURL, urlPattern } from "@lib/constants"
import { useNavigation } from "@store/historystack"
import { useSearchParams } from "next/navigation"
import { registerUserMutation, updateUser } from "@lib/helpers/mutations"
import Navbar from "@components/Navbar"

type CreationProps = {
    username: string;
    dob: Date | undefined;
    email: string;
}

type UpdationProps = {
    defaultValues: Partial<CurrentUser>
}

type Props = (
    ({ isEditing: true } & UpdationProps & Partial<CreationProps>)
    |
    ({ isEditing: false } & CreationProps & Partial<UpdationProps>)
)

const UserMutationPage = ({ username, isEditing, defaultValues, dob, email }: Props) => {

    const profileRef = useRef<InputManagerType<InputFrame>>(null);
    const linkRef = useRef<InputManagerType<LinkSchema[]>>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const navigation = useNavigation();
    const urlToRedirect = useSearchParams().get("url");

    const submitCreation = async (data: { name: string, bio: string }) => {
        if (!dob) return "Date of birth is required";
        else if (!email) throw new Error(`Email is required but got ${email}`);
        else if (!username) throw new Error(`Username is required but got ${username}`);

        const profile = profileRef.current?.getData();

        const { files, filesData } = await readyFrames(profile ? [profile] : []);
        const bioLinks = linkRef.current?.getData() ?? [];

        const redirectTo = urlToRedirect && urlPattern.test(new URL(urlToRedirect, parloculaAppURL).href) ? urlToRedirect : "/home";

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

    const submitUpdation = async (data: RegisterSchemaClientType) => {
        const bioLinks = linkRef.current?.getData();
        const profile = profileRef.current?.getData();

        const user = defaultValues;

        if (!user) throw new Error(`default value is required, got: ${defaultValues}`);

        const editedFields = checkEditedFields(
            { ...defaultValues, bioLinks: user.bioLinks, dob: user.dob ? new Date(user.dob).getTime() : undefined },
            { ...data, bioLinks }
        );

        let profileUpdate = {};

        // Check if current profile is same as the default one? if yes then leave it.
        if (profile?.path !== user.profile?.path) {

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

    const submit = async (data: any) => {
        if (!isEditing) return await submitCreation(data);
        else return await submitUpdation(data);
    }

    const requestSubmit = () => formRef.current?.requestSubmit();

    return (
        <>
            <Navbar
                navTitle={isEditing ? "Edit Profile" : "Create"}
                OptionButton={(
                    <button
                        className="primary"
                        onClick={requestSubmit}
                    >
                        {isEditing ? "Update" : "Join"}
                    </button>
                )}

            />

            <OptionalChildren condition={!isEditing}>
                <div className="my-4 space-y-2 text-center text-zinc-500 text-sm">
                    <p>This is a preview of how your profile would look.</p>
                    <p>All of the fields are optional here. You can either click on fields to edit them or skip and update them later.</p>
                </div>
            </OptionalChildren>

            <Form
                ref={formRef}
                submit={submit}
                schema={registerUserSchemaClient}
                skipReset
            >

                <section className="flex gap-4 mb-4 items-center">

                    <Poster ref={profileRef} defaultPoster={defaultValues?.profile?.path} />

                    <div className="space-y-2">
                        <DisplayNameInput
                            maxLength={25}
                            minLength={6}
                            name="name"
                            placeholder="Display Name"
                            required={false}
                            className="text-lg xs:text-xl sm:text-2xl"
                            defaultVal={defaultValues?.name}
                        />
                        <p className="text-sm">@{username}</p>
                    </div>
                </section>

                <MetadataTileContainer>
                    <MetadataTile skipDisc className="space-x-[6px]">
                        <span className="font-semibold text-center text-lg">X</span>
                        <span>Posts</span>
                    </MetadataTile>
                    <MetadataTile skipDisc className="space-x-[6px]">
                        <span className="font-semibold text-center text-lg">X</span>
                        <span>Followers</span>
                    </MetadataTile>
                    <MetadataTile skipDisc className="space-x-[6px]">
                        <span className="font-semibold text-center text-lg">X</span>
                        <span>Following</span>
                    </MetadataTile>
                </MetadataTileContainer>

                <section className="my-4 space-y-2">
                    <TextAreaInput
                        defaultVal={defaultValues?.bio}
                        maxLength={500}
                        name="bio"
                        placeholder="About Yourself"
                        required={false}
                    />

                    <LinkInputManager ref={linkRef} defaultLinks={defaultValues?.bioLinks} />
                </section>
            </Form>

            <UserPageMockup />

        </>
    )
}

export default UserMutationPage;