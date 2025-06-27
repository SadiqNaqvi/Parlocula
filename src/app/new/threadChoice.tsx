"use client";

import { LeftChevron } from "@assets/Icons";
import { InfiniteScroller, Modal, Navbar, Navigate } from "@components";
import { CheckTile, Form } from "@components/form";
import GeneralTile from "@components/GeneralTile";
import { closeFancyBox } from "@components/Modal";
import { threadsByUser } from "@lib/helpers/common";
import { generateInitialData, getQueryKeys, queryFunction } from "@lib/utils";
import useCurrentUser from "@store/user";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

type MereThread = { _id: string, name: string, poster: string };

const ThreadChoice = ({ submitChoice }: { submitChoice: (chosenThread: MereThread) => void }) => {

    const { threads, user } = useCurrentUser();
    const formRef = useRef<HTMLFormElement | null>(null);

    if (!user) return null;

    const submit = (chosenThread: MereThread) => {
        if (!chosenThread) return;
        submitChoice(chosenThread);
        closeFancyBox();
    }

    const ThreadCheckTile = ({ _id, name, poster }: MereThread) => (
        <GeneralTile title={name} poster={poster} onClick={() => submit({ _id, name, poster })} />
    )

    return (
        <Form ref={formRef} submit={submit}>
            <Navbar navTitle="Choose Thread" />
            <section className="mt-4">
                <InfiniteScroller
                    Component={ThreadCheckTile}
                    fetchData={p => queryFunction(threadsByUser, [user._id, p])}
                    queryKeys={getQueryKeys("threadOfUser_uid", { uid: user._id })}
                    initialData={generateInitialData(threads)}
                />
            </section>
        </Form>
    )

}

const ChooseThreadButton = forwardRef((_, ref) => {

    const [thread, setThread] = useState<MereThread | null>(null);

    useImperativeHandle(ref, () => ({
        getData: () => thread?._id
    }));

    const takeResult = (thread: MereThread) => {
        setThread(thread);
    }

    return <Modal
        buttonChildren={
            <button className="px-2 py-1 bg-gray40 rounded-xl">
                {thread?.name ?? "Choose Thread"}
            </button>
        }
        id="threadChoice"
    >
        <ThreadChoice submitChoice={takeResult} />
    </Modal>

})

export default ChooseThreadButton;