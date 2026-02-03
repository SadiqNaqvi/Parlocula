"use client";

import { XmarkIcon } from "@assets/Icons";
import { BottomSheet, BottomSheetRef, GeneralTile, InfiniteScroller } from "@components";
import { ParloImage } from "@components/ui";
import { joinedThreadsOfUser } from "@lib/helpers/common";
import { getQueryKeys } from "@lib/utils";
import useOfflineStore from "@store/offlineStore";
import useCurrentUser from "@store/user";
import { InfiniteQueryResponse, MereThread } from "@type/internal";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Drawer } from "vaul";

type Props = { defaultVal?: MereThread };

const ChoosenThread = ({ name, poster }: Pick<MereThread, "name" | "poster">) => {
    return (
        <div className="flex gap-2 items-center">
            <ParloImage
                containerClassName="rounded-full overflow-hidden"
                frame={poster}
                size={20}
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
        <div className="bg-primarylight py-4">
            <header className="flex gap-3 py-2 items-center">
                <Drawer.Close>
                    <XmarkIcon />
                </Drawer.Close>

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
        </div>
    )
}

const ChooseThreadButton = forwardRef(({ defaultVal }: Props, ref) => {

    const [thread, setThread] = useState<MereThread>();
    const sheetRef = useRef<BottomSheetRef>()

    useEffect(() => {
        if (defaultVal) setThread(defaultVal);
    }, [defaultVal])

    useImperativeHandle(ref, () => ({
        getData: () => thread?._id
    }));

    const takeResult = (thread: MereThread) => {
        setThread(thread);
        sheetRef.current?.close();
    }

    return (
        <BottomSheet
            ref={sheetRef}
            className="px-3 py-2 bg-gray10 rounded-full"
            button={
                thread ?
                    <ChoosenThread name={thread.name} poster={thread.poster} />
                    : "Choose Thread"
            }
        >
            <ThreadChoice submitChoice={takeResult} />
        </BottomSheet>
    )

})

ChooseThreadButton.displayName = "ChooseThreadButton";

export default ChooseThreadButton;