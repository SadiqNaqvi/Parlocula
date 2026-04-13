import { Navbar } from "@components";
import { Form, Input, Poster, Textarea } from "@components/form";
import ListSelector, { ListSelectorRef } from "@components/ListSelector";
import { searchNonBlockedUsers } from "@lib/helpers/common";
import { createRoomMutation } from "@lib/helpers/mutations";
import { useCustomReducer } from "@lib/hooks";
import { roomSchemaClient } from "@lib/schemas";
import { getQueryKeys, parloId, readyFrames } from "@lib/utils";
import useCurrentUser from "@store/user";
import { InputManagerType } from "@type/other";
import { InputFrame } from "@type/schemas";
import { useRouter } from "next/navigation";
import { useRef } from "react";

type GroupMetaType = { name: string, poster: InputFrame | null, inviteMessage: string }


const CreateGroup = () => {

    const { meta } = useCurrentUser();
    const ref = useRef<ListSelectorRef>(null);
    const posterRef = useRef<InputManagerType<InputFrame | null>>(null);
    const { inviteMessage, name, page = 1, poster, setter } = useCustomReducer<GroupMetaType & { page: number } | undefined>(undefined);
    const navigation = useRouter();
    const formRef = useRef<HTMLFormElement>(null);

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

        navigation.replace(`/inbox/${rmid}-${name}`);
    }

    const storeMeta = (data: Omit<GroupMetaType, "poster">) => {
        setter({
            inviteMessage: data.inviteMessage,
            name: data.name,
            page: 2,
            poster: posterRef.current?.getData(),
        })
    }

    const reqSubmit = () => {
        formRef.current?.requestSubmit();
    }

    if (page === 1) return (
        <>
            <Navbar
                hrefToRedirect="/inbox"
                navTitle="Create Group"
                OptionButton={(
                    <button onClick={reqSubmit} type="submit" className="primary">Next</button>
                )}
            />
            <Poster ref={posterRef} className="mt-4 mb-2 mx-auto" />
            <Form
                ref={formRef}
                className="space-y-4 px-2"
                submit={storeMeta}
                schema={roomSchemaClient}
                defaultVals={{ name, inviteMessage }}
            >
                <Input
                    name="name"
                    placeholder="Eg: Movie Yappers"
                    label="Name of the group"
                    className="border-0 border-b rounded-none px-0"
                />

                <Textarea
                    name="inviteMessage"
                    placeholder="Eg: Hey, Let's yap about the new movie"
                    className="border-0 border-b rounded-none px-0"
                    label="Invitation Message"
                    description="You can neither send more than one invitation message nor change it in future. Make it worth."
                />
            </Form>
        </>

    )

    return (
        <>
            <Navbar
                onGoBack={() => setter({ page: 1 })}
                navTitle="Create Group"
                OptionButton={(
                    <button onClick={create} type="submit" className="primary">Create</button>
                )}
            />

            <div className="px-2">
                <ListSelector
                    mode="search"
                    queryFn={(q, p) => searchNonBlockedUsers(uid, q, p)}
                    queryKeys={(q) => getQueryKeys("searchNonBlockedUser_query_uid", { uid, query: q })}
                    refiner={(resp) => ({
                        id: resp._id,
                        title: resp.username,
                        poster: resp.profile,

                    })}
                    returnIds
                    inputPlaceholder="Search user to add"
                    callbackRef={ref}
                    frameType="userProfile"
                />
            </div>

        </>
    )

}

export default CreateGroup;