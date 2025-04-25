"use client";

import { CreateEditPost } from "@components";
import { LoadingSpinner, NotFound } from "@components/ui";
import { useCustomReducer } from "@lib/hooks";
import { isValidObjectId, readyFrames } from "@lib/utils";
import useCurrentUser from "@store/user";
import { InputFrame, PostSchemaType } from "@type/schemas";
import { useRouter, useSearchParams } from "next/navigation";
import ThreadChoice from "./threadChoice";
import { createPost } from "@lib/helpers/client";

type CallbackVal = Omit<PostSchemaType & { frames: InputFrame[] }, "files" | "filesData" | "thread_id">

export default function Page() {

    const { user, isHydrated } = useCurrentUser();

    const params = useSearchParams();
    const router = useRouter();

    const tid = params.get("tid");
    const thread_id = tid && isValidObjectId(tid) ? tid : "";

    // Fix Post schema/ Check frames get/ Create Edit Post method/ If error = pp104, do not throw error in reaction. 

    const {
        chosenThread,
        isThreadChosen,
        setter
    } = useCustomReducer({
        isThreadChosen: Boolean(thread_id),
        chosenThread: thread_id,
    });

    if (!isHydrated) return <LoadingSpinner />

    if (!user) return (
        <NotFound
            title="You are not allowed here!"
            paras={["Please log-in to start posting."]}
        />
    )

    const submitPost = async (postData: CallbackVal) => {
        if (!chosenThread) return;
        const { frames, ...data } = postData;
        const { files, filesData } = await readyFrames(frames);
        const dataToPost = { ...data, files, filesData }
        return await createPost({ ...dataToPost, thread_id: chosenThread }, user._id, router);
    }

    const submitChoice = (id: string) => {
        if (id && isValidObjectId(id))
            setter({ chosenThread: id, isThreadChosen: true })
        console.log(id)
    }

    const goBack = () => {
        setter({ isThreadChosen: false })
    }

    return (
        <>
            {isThreadChosen ?
                <CreateEditPost goBack={goBack} isEditing={false} callback={submitPost} />
                :
                <ThreadChoice submitChoice={submitChoice} />
            }
        </>
    )
}