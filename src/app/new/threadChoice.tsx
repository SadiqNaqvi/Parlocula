"use client";

import { XmarkIcon } from "@assets/Icons";
import { InfiniteScroller, Navbar } from "@components";
import BottomSheetTrigger from "@components/BottomSheet";
import { Form } from "@components/form";
import GeneralTile from "@components/GeneralTile";
import { threadsByUser } from "@lib/helpers/common";
import { getQueryKeys } from "@lib/utils";
import useOfflineStore from "@store/offlineStore";
import useCurrentUser from "@store/user";
import { InfiniteQueryResponse } from "@type/internal";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Drawer } from "vaul";

type MereThread = { _id: string, name: string, poster: string };

const ThreadChoice = ({ submitChoice }: { submitChoice: (chosenThread: MereThread) => void }) => {

    const [threadList, setThreadList] = useOfflineStore<InfiniteQueryResponse | undefined>("joined-threads", undefined)
    const { meta } = useCurrentUser();
    const formRef = useRef<HTMLFormElement | null>(null);

    if (!meta) return null;

    const submit = (chosenThread: MereThread) => {
        if (!chosenThread) return;
        submitChoice(chosenThread);
    }

    const ThreadCheckTile = ({ _id, name, poster }: MereThread) => (
        <GeneralTile title={name} poster={poster} onClick={() => submit({ _id, name, poster })} />
    )

    return (
        <Form ref={formRef} submit={submit}>
            <header className="space-x-3">
                <Drawer.Close>
                    <XmarkIcon />
                </Drawer.Close>

                <h3>Choose Thread</h3>
            </header>
            <section className="mt-4">
                <InfiniteScroller
                    Component={ThreadCheckTile}
                    fetchData={p => threadsByUser(meta.user_id, p)}
                    queryKeys={getQueryKeys("threadOfUser_uid", { uid: meta.user_id })}
                    onSuccess={(d) => {
                        if (d.pages[0]?.page === 1)
                            setThreadList(d.pages[0])
                    }}
                    placeholderData={threadList}
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

    return (
        <BottomSheetTrigger
            className="px-2 py-1 bg-gray20 rounded-xl"
            button={thread?.name ?? "Choose Thread"}
        >
            <ThreadChoice submitChoice={takeResult} />
        </BottomSheetTrigger>
    )

})

ChooseThreadButton.displayName = "ChooseThreadButton";

export default ChooseThreadButton;