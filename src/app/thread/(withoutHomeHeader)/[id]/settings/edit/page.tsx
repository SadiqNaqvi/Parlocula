"use client";

import ConnectionsInput from "@app/thread/(withoutHomeHeader)/new/ConnectionsInput";
import { LinkInputManager, Navbar } from "@components";
import { Form, Input, Poster, Textarea, ToggleButton } from "@components/form";
import { LoadingSpinner } from "@components/ui";
import { getThreadById } from "@lib/helpers/common";
import { editThreadMutation } from "@lib/helpers/mutations";
import { useQueryHook } from "@lib/hooks";
import appToast from "@lib/providers/toast";
import { threadSchemaClient } from "@lib/schemas";
import { checkEditedFields, getQueryKeys, readyFrames } from "@lib/utils";
import { useNavigation } from "@store/historystack";
import useCurrentUser from "@store/user";
import { Thread } from "@type/internal";
import { InputManagerType } from "@type/other";
import { InputFrame, ThreadUpdateSchema } from "@type/schemas";
import { useParams } from "next/navigation";
import { useRef } from "react";

const ThreadEditPage = () => {

    const { meta } = useCurrentUser();
    const posterRef = useRef<InputManagerType<InputFrame>>(null);
    const linksRef = useRef<InputManagerType>(null);
    const connectionsRef = useRef<InputManagerType>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const navigation = useNavigation();

    const { id } = useParams();
    const tid = (id as string).split('-')[0];

    const { data, isFetching } = useQueryHook<Thread>({
        queryFn: () => getThreadById(tid),
        queryKeys: getQueryKeys("thread_id", { id: tid }),
        enabled: Boolean(meta),
    });

    if (isFetching) return <LoadingSpinner />
    else if (!meta || !data) return null;

    const submit = async (updatedData: Pick<ThreadUpdateSchema, "name" | "description" | "nsfw">) => {

        const { poster, links, connections, name, description, nsfw } = data;

        const updatedConnections = connectionsRef.current?.getData() || [];
        const updatedLinks = linksRef.current?.getData() || [];
        const updatedPoster = posterRef.current?.getData();

        const editedFields = checkEditedFields(
            { name, description, nsfw, connections, links },
            { ...updatedData, connections: updatedConnections, links: updatedLinks }
        )

        let additionalFields: Partial<ThreadUpdateSchema> = {};

        if (updatedPoster && updatedPoster.path !== poster) {
            const { files, filesData } = await readyFrames(updatedPoster);
            additionalFields = {
                files,
                filesData,
                filesToRemove: [{
                    type: "image",
                    path: poster,
                }]
            }
        }

        const error = await editThreadMutation(tid, meta.user_id, { ...editedFields, ...additionalFields });

        if (error) return error;
        else appToast.success("Thread Updated Successfully");
        navigation.back();

    }

    const requestSubmit = () => {
        formRef.current?.requestSubmit();
    }

    return (
        <>
            <Navbar
                navTitle="Edit Thread"
                OptionButton={
                    <button type="submit" className="primary" onClick={requestSubmit}>Save</button>
                }
            />

            <Poster defaultPoster={data.poster} ref={posterRef} />

            <Form
                ref={formRef}
                defaultVals={data}
                schema={threadSchemaClient}
                submit={submit}
                className="space-y-6"
            >

                <Input
                    name="name"
                    placeholder="Eg: Spider Man"
                    label="Name"
                    required
                    minLength={5}
                    maxLength={30}
                />

                <Textarea
                    name="description"
                    label="Description"
                    placeholder="Eg: About the thread and rules if any."
                    required
                    maxLength={500}
                />

                <ToggleButton label="nsfw" className="w-full py-4 uppercase" />

            </Form>

            <ConnectionsInput defaultConnections={data.connections} ref={connectionsRef} />
            <LinkInputManager defaultLinks={data.links} ref={linksRef} />
        </>
    )

}

export default ThreadEditPage;