"use client";

import { BottomSheet, BottomSheetRef, GeneralTile, InfiniteScroller, NestedSheet } from "@components";
import { OptionalChildren, ParloImage } from "@components/ui";
import { joinedThreadsOfUser } from "@lib/helpers/common";
import { getQueryKeys } from "@lib/utils";
import useOfflineStore from "@store/offlineStore";
import useCurrentUser from "@store/user";
import { InfiniteQueryResponse, MereThread } from "@type/internal";
import { useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";

type Props = { defaultVal?: MereThread };

const ChoosenThread = ({ name, poster }: Pick<MereThread, "name" | "poster">) => {
    return (
        <div className="flex gap-2 items-center">
            <ParloImage
                frameType="poster"
              //  extSize="w92"
                className="rounded-full min-w-12 size-12 object-cover"
                frame={poster}
                size={48}
                alt={`Poster of thread ${name}`}
            />
            <h4>{name}</h4>
        </div>
    )
}

const ThreadChoice = ({ submitChoice }: { submitChoice: (chosenThread: MereThread) => void } & Props) => {

    const [threadList, setThreadList] = useOfflineStore<InfiniteQueryResponse | undefined>("joined-threads", undefined)
    const { meta } = useCurrentUser();

    if (!meta) return null;

    const submit = (chosenThread: MereThread) => {
        if (!chosenThread) return;
        submitChoice(chosenThread);
    }

    const ThreadCheckTile = ({ _id, name, poster }: MereThread) => (
        <GeneralTile title={name} poster={poster?.path} onClick={() => submit({ _id, name, poster })} />
    )

    return (
        <>
            <header className="">
                <h3>Choose Thread</h3>
            </header>
            <section className="mt-4">
                <InfiniteScroller
                    Component={ThreadCheckTile}
                    fetchData={p => joinedThreadsOfUser(meta.user_id, p)}
                    queryKeys={getQueryKeys("joinedThreadsOfUser_uid", { uid: meta.user_id })}
                    onSuccess={(d) => {
                        if (d.pages[0]?.page === 1)
                            setThreadList(d.pages[0])
                    }}
                    placeholderData={threadList}

                />
            </section >
        </>
    )
}

const ChooseThreadButton = ({ defaultVal, submit }: Props & { submit: (tid: string) => void }) => {

    const [thread, setThread] = useState<MereThread>();
    const sheetRef = useRef<BottomSheetRef>();

    useEffect(() => {
        if (defaultVal) setThread(defaultVal);
    }, [defaultVal]);

    const takeResult = (thread: MereThread) => {
        setThread(thread);
        sheetRef.current?.close();
    }

    const giveResult = () => {
        if (thread) {
            submit(thread._id);
            sheetRef.current?.close();
        }
    }

    return (
        <section>
            <h5 className="text-lg font-semibold mb-4">Post In:</h5>
            <NestedSheet
                ref={sheetRef}
                className="p-3 w-full bg-gray10 border-gray10 rounded-md"
                button={
                    <OptionalChildren condition={thread} fallback="Choose a thread to post">
                        <ChoosenThread name={thread?.name || ""} poster={thread?.poster} />
                    </OptionalChildren>
                }
            >
                <ThreadChoice submitChoice={takeResult} />
            </NestedSheet>
            <OptionalChildren condition={thread}>
                <Drawer.Close className="primary w-full mt-4" onClick={giveResult}>Post</Drawer.Close>
            </OptionalChildren>
        </section>
    )

}

export default ChooseThreadButton;