"use client";

import { CreateEditPost } from "@components";
import { LoadingSpinner, NotFound } from "@components/ui";
import { createPost } from "@lib/helpers/client";
import { isValidObjectId, readyFrames } from "@lib/utils";
import useCurrentUser from "@store/user";
import { InputFrame, PostSchemaType } from "@type/schemas";
import { useRouter, useSearchParams } from "next/navigation";

type CallbackVal = Omit<PostSchemaType & { frames: InputFrame[] }, "files" | "filesData" | "thread_id"> & { thread_id?: string }

export default function Page() {

    const { user, isHydrated } = useCurrentUser();

    const params = useSearchParams();
    const router = useRouter();

    const tid = params.get("tid");
    const thread_id = tid && isValidObjectId(tid) ? tid : undefined;

    if (!isHydrated) return <LoadingSpinner />

    if (!user) return (
        <NotFound
            title="You are not allowed here!"
            paras={["Please log-in to start posting."]}
        />
    )

    const submitPost = async (postData: CallbackVal) => {
        const { frames, thread_id, ...data } = postData;
        if (!thread_id) return "Choose a thread to post."

        const { files, filesData } = await readyFrames(frames);
        const dataToPost = { ...data, files, filesData, thread_id }
        return await createPost(dataToPost, user._id, router);
    }

    return <CreateEditPost defaultThread={thread_id} isEditing={false} callback={submitPost} />
}