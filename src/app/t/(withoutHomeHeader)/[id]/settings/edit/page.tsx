"use client";

import ConnectionsInput from "@app/t/(withoutHomeHeader)/new/ConnectionsInput";
import { LinkInputManager, Navbar } from "@components";
import { Form, Input, Poster, Textarea, ToggleButton } from "@components/form";
import { LoadingSpinner } from "@components/ui";
import { updateThread } from "@lib/helpers/client";
import { getThreadById } from "@lib/helpers/common";
import { useQueryHook } from "@lib/hooks";
import { threadSchemaClient, threadUpdateSchema } from "@lib/schemas";
import { getQueryKeys, queryFunction } from "@lib/utils";
import useCurrentUser from "@store/user";
import { Thread } from "@type/internal";
import { InputManagerType } from "@type/other";
import { ThreadUpdateSchema } from "@type/schemas";
import { useParams } from "next/navigation";
import { useRef } from "react";

const ThreadEditPage = () => {

    const { user, isHydrated } = useCurrentUser();
    const posterRef = useRef<InputManagerType>(null);
    const linksRef = useRef<InputManagerType>(null);
    const connectionsRef = useRef<InputManagerType>(null);
    const { id } = useParams();
    const tid = (id as string).split('-')[0];

    const { data, isFetching } = useQueryHook<Thread>({
        queryFn: () => queryFunction(getThreadById, [tid]),
        queryKeys: getQueryKeys("thread_id", { id: tid }),
        enabled: Boolean(user)
    });

    if (!isHydrated || isFetching) return <LoadingSpinner />
    if (!user || !data) return null;

    const submit = async (updatedData: ThreadUpdateSchema) => {
        await updateThread(tid, user._id, updatedData)
    }

    return (
        <>
            <Form
                defaultVals={data}
                schema={threadSchemaClient}
                submit={d => console.log(threadUpdateSchema.safeParse(d))}
                className="space-y-6"
            >
                <Navbar navTitle="Edit Thread" OptionButton={<button type="submit" className="primary">Save</button>} />

                <Poster defaultPoster={data.poster} ref={posterRef} />

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

            <ConnectionsInput defaultConnections={data.connection} ref={connectionsRef} />
            <LinkInputManager defaultLinks={data.links} ref={linksRef} />
        </>
    )

}

export default ThreadEditPage;