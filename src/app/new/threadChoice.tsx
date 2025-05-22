import { LeftChevron } from "@assets/Icons";
import { Navigate } from "@components";
import { CheckTile, Form } from "@components/form";
import useCurrentUser from "@store/user";
import { useRef, useState } from "react";

// const searchThreads = async (user_id: string | undefined, query: string): Promise<Omit<MereThread, "description">[] | null> => {
//     if (!user_id) return null;
//     const { errCode, result, success } = await threadsByUser(user_id);
//     if (!success) throw new Error(errCode);
//     return result;
// }

const ThreadChoice = ({ submitChoice }: { submitChoice: (id: string) => void }) => {

    const { threads } = useCurrentUser();
    const [query, setQuery] = useState("");

    const formRef = useRef<HTMLFormElement | null>(null)

    // const { data, isFetching, error, refetch } = useQueryHook<Omit<MereThread, "description">[]>({
    //     queryKeys: [`Threads_with_query:${query}`],
    //     queryFn: () => searchThreads(user?._id, query),
    //     enabled: query.length >= 3 && !!user?._id,
    // });

    const updateQuery = (data: FormData) => {
        const q = data.get("query") as string;
        if (!q || q.length < 5 || q.length > 40) return;
        console.log(q)
        // setQuery(q)
    }

    // Change check box to radio
    const submit = ({ threadChoice }: { threadChoice: string | null }) => {
        if (!threadChoice) return;
        submitChoice(threadChoice);
    }

    const reqSubmit = () => {
        if (formRef.current) formRef.current.requestSubmit();
    }

    return (
        <>
            <header className="flex flex-cntr-between">
                <section className="gap-4 flex items-center">
                    <Navigate comp="button" goto="back"><LeftChevron /></Navigate>
                    <h1 className="text-2xl inline">Choose Thread To Post</h1>
                </section>
                <section>
                    <button className="primary" onClick={reqSubmit}>Next</button>
                </section>
            </header>

            <Form ref={formRef} submit={submit}>
                <ul className="space-y-3">
                    {threads.map(({ _id, name, poster }) => (
                        <li key={_id} className="border-b-2 border-zinc-500 last:border-0">
                            <CheckTile group="threadChoice" type="radio" label={name} name={_id} poster={poster} />
                        </li>
                    ))}
                </ul>
            </Form>

        </>
    )

}

export default ThreadChoice;