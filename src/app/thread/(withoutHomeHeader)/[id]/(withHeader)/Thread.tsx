"use client"

import { BottomSheet, FancyImage, GenericWrapper, Navigate, ObserverHeader } from "@components";
import { TabContainer, TabList } from "@components/ui/Tabs";
import { getThreadById } from "@lib/helpers/common";
import { getQueryKeys } from "@lib/utils";
import { Thread as ThreadType } from "@type/internal";
import { ActionsButton, EllipsisButton, ThreadDetailsSheet } from "./";
import { OptionalChildren, ParloImage } from "@components/ui";
import { ContentFiltered } from "@components/fallbacks";

type Props = { id: string, uid?: string }

const getQueryProps = ({ id }: Props) => ({
    queryKeys: getQueryKeys("thread_id", { id }),
    queryFn: getThreadById,
    args: [id],
});

const Component = (data: ThreadType, { id, uid }: Props) => {

    const { _id, connections, creator, createdAt, created_by, description, links, member_count, nsfw, edited_by, poster, post_count, name, managers } = data;

    return (
        <>

            <OptionalChildren condition={nsfw}>
                <ContentFiltered allow={uid === created_by} redirectPath={`/thread/${_id}`} />
            </OptionalChildren>
            <ObserverHeader
                navTitle={name}
                titleToShare={`Check out a thread on "${name}" on Parlocula`}
                OptionButton={<EllipsisButton creator={created_by} tid={_id} />}
                className="px-2 sm:px-4 mt-2">

                <section className="flex gap-2 sm:gap-4 items-center">
                    <ParloImage
                        className="min-w-24 size-24 sm:min-w-32 sm:size-32 object-cover rounded-full"
                        frame={poster}
                        frameType="threadPoster"
                        fancyGallery="thread-poster"
                        fileNameToDownload={`Poster of thread "${name}" - Parlocula`}
                        height={128} width={128}
                        alt="Poster"
                        prioritize
                    />

                    <div className="space-y-2">
                        <h1 data-observe className="text-lg sm:text-xl md:text-2xl line-clamp-2 capitalize font-semibold">{name}</h1>
                        <p className="text-sm space-x-2">
                            <span>Created by</span>
                            <Navigate className="inline underline" comp="link" goto={`/user/${creator}`}>@{creator}</Navigate>
                        </p>
                    </div>

                </section>
                <section className="mt-4">

                    <OptionalChildren condition={nsfw}>
                        <div className="my-4">
                            <span className="py-1 px-2 rounded-md border border-purple-500 bg-purple-500/30">NSFW</span>
                        </div>
                    </OptionalChildren>

                    <BottomSheet className="text-sm line-clamp-2 whitespace-break-spaces text-left" button={description}>
                        <ThreadDetailsSheet
                            connections={connections}
                            createdAt={createdAt}
                            creator={creator}
                            description={description}
                            edited_by={edited_by}
                            links={links}
                            managers={managers}
                        />
                    </BottomSheet>
                </section>

                <section className="mt-4">
                    <ActionsButton uid={uid} thread={{ _id, name, poster }} />
                </section>

            </ObserverHeader>

            <TabContainer className="my-4">
                <TabList href={`/thread/${id}`}>Posts</TabList>
                <TabList href={`/thread/${id}/frames`}>Frames</TabList>
                <TabList href={`/thread/${id}/links`}>Links</TabList>
            </TabContainer>
        </>
    )

}

const Thread = (props: Props) => (
    <GenericWrapper component={Component} getQueryProps={getQueryProps} props={props} />
);

export default Thread;