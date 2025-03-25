"use client";

import UserBasedButton from "@components/UserBasedButton";
import { isMember, joinThread, leaveThread } from "@lib/actions/clientActions";
import { MutationFnProps } from "@type/internal";
import toast from "react-hot-toast";

const fetchData = async (tid: string, uid?: string) => {
    if (!uid) return false;
    const { errCode, result, success } = await isMember({ tid, uid });
    if (!success) throw new Error(errCode);
    return result;
}

type ButtonProps = {
    state: boolean,
    isPending: boolean,
    onClick: (state: boolean) => void;
}

const JoinButton = ({ tid, tname, tposter }: { tid: string, tname: string, tposter: string }) => {

    const mutationFn = async ({ state, user, setUserHash }: MutationFnProps<boolean>) => {
        console.log(state);
        // await new Promise((res) => setTimeout(() => res(""), 5000))
        toast.success("Something went wrong! Please try again", {
            className: "bg-red-500",
            duration: 1000 * 60 * 60
        })
        // if (state) {
        //     const error = await joinThread({ setUserHash, tid, tname, tposter, user })
        //     if (error) toast.error(error);
        // } else {
        //     const error = await leaveThread({ setUserHash, tid, user })
        //     if (error) toast.error(error);
        // }
    }

    const Button = ({ isPending, onClick, state }: ButtonProps) => (
        <>{state ?
            <button className="secondary" disabled={isPending} onClick={() => onClick(false)}>Joined</button>
            :
            <button className="primary" disabled={isPending} onClick={() => onClick(true)}>Join</button>
        }
        </>
    )

    return <UserBasedButton
        Button={Button}
        queryFn={(user) => fetchData(tid, user?._id)}
        queryKeys={[`member`, tid]}
        mutationFn={mutationFn}
        className="p-2 border border-gray-500 rounded-md"
    />
}

export default JoinButton;