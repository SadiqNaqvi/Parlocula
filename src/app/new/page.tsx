"use client";

import { CreateEditPost } from "@components";
import { Form, Input, RadioThreadTile } from "@components/form";
import { LoadingSpinner, NotFound, ShowError } from "@components/ui";
import { createPost } from "@lib/actions/clientActions";
import { useCustomReducer, useQueryHook } from "@lib/hooks";
import { PostSchemaType } from "@lib/schemas";
import useCurrentUser from "@store/user";
import { MereThread } from "@type/internal";
import { isValidObjectId } from "mongoose";
import { useSearchParams } from "next/navigation";
import { z } from "zod";

const searchThreads = async (user_id: string | undefined, query: string): Promise<Omit<MereThread, "description">[] | null> => {
    if (!user_id) return null;
    const { errCode, result, success } = await getThreads(query, user_id);
    if (!success) throw new Error(errCode);
    return result;
}

const schema = z.object({
    thread_id: z.string()
});

export default function Page() {

    const { user } = useCurrentUser();

    const {
        query,
        chosenThread,
        postInfo,
        setter
    } = useCustomReducer<{
        query: string,
        chosenThread: string,
        postInfo: PostSchemaType | null
    }>({
        query: "",
        chosenThread: "",
        postInfo: null
    });

    const { data, isFetching, error, refetch } = useQueryHook<Omit<MereThread, "description">[]>({
        queryKeys: [`Threads_with_query:${query}`],
        queryFn: () => searchThreads(user?._id, query),
        enabled: query.length >= 3 && !!user?._id,
    });

    if (!user) return (
        <NotFound
            title="You are not allowed here!"
            paras={["Please log-in to start posting."]}
        />
    )

    const submitPost = async ({ thread_id }: { thread_id: string }) => {
        if (!chosenThread || !postInfo) return;
        return await createPost({ ...postInfo, thread_id });
    }

    const takePostInfoAndContinue = (postInfo: PostSchemaType) => {
        if (!postInfo) return;
        // Save post info and move user to choose threads to post.
        setter({ postInfo });
        const params = useSearchParams();
        const thread_id = params.get("tid");
        if (!thread_id || !isValidObjectId(thread_id)) return;
        submitPost({ thread_id });
    }

    const ThreadLists = ({ heading, data }: { heading: string, data: Omit<MereThread, "description">[] }) => {
        return (
            <>
                <h2 className="text-lg font-semibold">{heading}</h2>
                <Form schema={schema} submit={submitPost}>
                    <ul>
                        {data.map(el => (
                            <RadioThreadTile htmlName="thread_id" {...el} />
                        ))}
                    </ul>
                </Form>
            </>
        )
    }

    return (
        <>
            <>
                <header>
                    <section className="flex flex-cntr-between">
                        <div>
                            <h1>Choose a thread to post</h1>
                            <p className="text-sm text-zinc-500">Note: You can only choose fom the threads you have already joined.</p>
                        </div>
                        <button className="primary">Post</button>
                    </section>
                    <form className="flex gap-4">
                        <Input name="threadName" minLength={3} maxLength={25} placeholder="Enter name of the thread. At least 3 characters are required." />
                        <button className="secondary">Search</button>
                    </form>
                </header>
                <section className="h-dvh">
                    {query ?
                        <>
                            {isFetching && <LoadingSpinner />}
                            {error && <ShowError retry={refetch} heading="Oops! Fetch Failed" errCode={error.message} />}
                            {data && data.length ?
                                <ThreadLists heading={`Results for "${query}":`} data={data} />
                                :
                                <NotFound
                                    title="Looks like you have not joined any thread yet."
                                    paras={["Please join a thread to start posting."]}
                                />}
                        </>
                        :
                        <ThreadLists heading="Recently joined threads:" data={user.recently_joined} />
                    }
                </section>
            </>
            <CreateEditPost callback={takePostInfoAndContinue} />
        </>
    )
}