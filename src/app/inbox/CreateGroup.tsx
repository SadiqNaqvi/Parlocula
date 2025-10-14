import { Navbar } from "@components";
import { Form, Input, Poster, Textarea } from "@components/form";
import ListSelector, { ListSelectorRef } from "@components/ListSelector";
import { createRoom } from "@lib/helpers/client";
import { searchUsersForGroup } from "@lib/helpers/common";
import { useCreateRoomMutation } from "@lib/helpers/room/client";
import { useCustomReducer } from "@lib/hooks";
import { roomSchemaClient } from "@lib/schemas";
import { ObjectId, readyFrames } from "@lib/utils";
import useCurrentUser from "@store/user";
import { MereUser } from "@type/internal";
import { InputManagerType } from "@type/other";
import { InputFrame, RoomSchemaType } from "@type/schemas";
import { PropsWithChildren, useRef } from "react";

type GroupMetaType = { name: string, poster: InputFrame | null, inviteMessage: string }

const SubmitButton = ({ children, onSubmit }: PropsWithChildren<{ onSubmit?: () => void }>) => {
    return (
        <footer className="fixed w-full bottom-0 p-2 flex sm:justify-center">
            <button onClick={onSubmit} type="submit" className="primary flex-1 sm:flex-0">{children}</button>
        </footer>
    )

}

const CreateGroup = ({ goBack }: { goBack: () => void }) => {

    const { meta } = useCurrentUser();
    const ref = useRef<ListSelectorRef>(null);
    const posterRef = useRef<InputManagerType<InputFrame | null>>(null);
    const { inviteMessage, name, page = 1, poster, setter } = useCustomReducer<GroupMetaType & { page: number } | undefined>(undefined);

    const createRoom = useCreateRoomMutation();

    if (!meta) return null;

    const create = async () => {
        const { files, filesData } = await readyFrames(poster ? [poster] : []);
        const participants = ref.current?.() ?? []

        return createRoom.mutate({
            message: inviteMessage,
            rmid: ObjectId.toString(),
            room: {
                files, filesData, name,
                type: "group", participants,
                poster: poster?.path,
            },
            ruid: undefined,
            user: meta,

        });
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
                <Input name="name" placeholder="Eg: Marvel Yappers" label="Name of the group" />

                <Textarea
                    name="inviteMessage"
                    placeholder="Eg: Hey, Let's yap about spiderman"
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
                    queryFn={(q, p) => searchUsersForGroup(meta.user_id, q, p)}
                    queryKeys={(q) => ["usxers", "search", "forGroup", q]}
                    refiner={(resp: MereUser) => ({
                        id: resp._id,
                        title: resp.username,
                        poster: resp.profile
                    })}
                    inputPlaceholder="Search user to add"
                    ref={ref}
                />
                <SubmitButton onSubmit={create}>Create</SubmitButton>
            </div>

        </>
    )

}

export default CreateGroup;