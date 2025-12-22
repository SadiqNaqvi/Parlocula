"use client";

import { CreateEditPost } from "@components";
import { CreateEditPostReturn } from "@components/CreateEditPost";
import LoginModal from "@components/fallbacks/LoginModal";
import { createPostMutation } from "@lib/helpers/mutations";
import { parloId, readyFrames } from "@lib/utils";
import useGlobalStore from "@store/globalStore";
import { useNavigation } from "@store/historystack";
import useCurrentUser from "@store/user";
import { MereThread } from "@type/internal";
import { nanoid } from "nanoid";
import { useEffect } from "react";

const NewPostPage = () => {

    const { meta } = useCurrentUser();
    const navigation = useNavigation();

    const [thread, setThread] = useGlobalStore<MereThread | undefined>("chosenThreadToPost");
    const [quotedPost, setQuotedPost] = useGlobalStore<{ title: string, id: string, author: string } | undefined>("postToQuote");

    useEffect(() => {
        return () => {
            if (process.env.NODE_ENV !== "development") {
                setThread(undefined);
                setQuotedPost(undefined);
            }
        }
    }, []);

    if (!meta) return (
        <LoginModal
            title="Oops! You got arrested by The Parlocula Guards"
            redirectTo="/new"
        />
    )

    const submitPost = async (postData: CreateEditPostReturn) => {
        const { frames, thread_id, ...data } = postData;

        if (!thread_id) return "Choose a thread to post."

        const { files, filesData } = await readyFrames(frames);

        return await createPostMutation(
            meta.user_id,
            {
                ...data,
                _id: parloId(),
                files,
                filesData,
                thread_id,
                quoted_post_id: quotedPost?.id,
                quoted_post_author: quotedPost?.author,
            },
            navigation
        );
    }

    return <CreateEditPost
        defaultVal={undefined}
        isEditing={false}
        callback={submitPost}
        defaultThread={thread}
        titleOfQuotedPost={quotedPost?.title}
    />
}

export default NewPostPage;