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
    const submit = (data: { [key: string]: boolean }) => {
        // console.log(data);
        submitChoice(Object.keys(data)[0]);
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

            {/* USE ZOD */}
            <form className="my-4" action={updateQuery}>
                <input
                    className="px-4 py-2 w-full bg-gray20 rounded-md"
                    placeholder="Search for threads"
                    type="search"
                    name="query"
                    minLength={5}
                    maxLength={40} />
            </form>

            <Form ref={formRef} submit={submit}>
                <ul className="space-y-3">
                    {threads.map(({ _id, name, poster }) => (
                        <li key={_id} className="border-b-2 border-zinc-500 last:border-0">
                            <CheckTile lable={name} name={_id} poster={poster} />
                        </li>
                    ))}
                </ul>
            </Form>

        </>
    )

}

export default ThreadChoice;