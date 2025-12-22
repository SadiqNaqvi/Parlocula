import { Navbar } from "@components";
import { Form, Input, Poster, Textarea } from "@components/form";
import ListSelector, { ListSelectorRef } from "@components/ListSelector";
import { searchNonBlockedUsers } from "@lib/helpers/common";
import { createRoomMutation } from "@lib/helpers/mutations";
import { useCustomReducer } from "@lib/hooks";
import { roomSchemaClient } from "@lib/schemas";
import { getQueryKeys, parloId, readyFrames } from "@lib/utils";
import { useNavigation } from "@store/historystack";
import useCurrentUser from "@store/user";
import { InputManagerType, TypedFunction } from "@type/other";
import { InputFrame } from "@type/schemas";
import { nanoid } from "nanoid";
import { PropsWithChildren, useRef } from "react";

type GroupMetaType = { name: string, poster: InputFrame | null, inviteMessage: string }

const SubmitButton = ({ children, onSubmit }: PropsWithChildren<{ onSubmit?: TypedFunction }>) => {
    return (
        <footer className="fixed w-full bottom-0 p-2 flex sm:justify-center">
            <button onClick={onSubmit} type="submit" className="primary flex-1 sm:flex-0">{children}</button>
        </footer>
    )
}


const CreateGroup = ({ goBack }: { goBack: TypedFunction }) => {

    const { meta } = useCurrentUser();
    const ref = useRef<ListSelectorRef>(null);
    const posterRef = useRef<InputManagerType<InputFrame | null>>(null);
    const { inviteMessage, name, page = 1, poster, setter } = useCustomReducer<GroupMetaType & { page: number } | undefined>(undefined);
    const navigation = useNavigation();

    if (!meta) return null;

    const uid = meta.user_id;

    const create = async () => {
        const { files, filesData } = await readyFrames(poster ? [poster] : []);
        const participants = ref.current?.();

        if (!participants || !participants.length) return;

        const rmid = parloId();

        createRoomMutation(
            rmid,
            {
                files, filesData, name,
                type: "group", participants,
                poster: poster?.path,
                display_name: name,
                inviteMessage
            },
            undefined
        );

        navigation.goto(`/inbox/${rmid}`);
    }

    const storeMeta = (data: Omit<GroupMetaType, "poster">) => {
        setter({
            inviteMessage: data.inviteMessage,
            name: data.name,
            page: 2,
            poster: posterRef.current?.getData(),
        })
    }

    if (page === 1) return (
        <>
            <Navbar onGoBack={goBack} navTitle="Create Group" />
            <Poster ref={posterRef} className="mt-4 mb-2 mx-auto" />
            <Form
                className="space-y-2"
                submit={storeMeta}
                schema={roomSchemaClient}
            >
                <Input name="name" placeholder="Eg: Movie Yappers" label="Name of the group" />

                <Textarea
                    name="inviteMessage"
                    placeholder="Eg: Hey, Let's yap about the new movie"
                    label="Invitation Message"
                    description="You can neither send more than one invitation message nor change it in future. Make it worth."
                />

                <SubmitButton>Next</SubmitButton>

            </Form>
        </>

    )

    return (
        <>
            <Navbar onGoBack={goBack} navTitle="Create Group" />

            <div className="mb-8 w-full">
                <ListSelector
                    queryFn={(q, p) => searchNonBlockedUsers(uid, q, p)}
                    queryKeys={(q) => getQueryKeys("searchNonBlockedUser_query_uid", { uid, query: q })}
                    refiner={(resp) => ({
                        id: resp._id,
                        title: resp.username,
                        poster: resp.profile,

                    })}
                    inputPlaceholder="Search user to add"
                    callbackRef={ref}
                />

                <SubmitButton onSubmit={create}>Create</SubmitButton>

            </div>

        </>
    )

}

export default CreateGroup;