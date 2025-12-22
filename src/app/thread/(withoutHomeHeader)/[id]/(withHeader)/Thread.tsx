"use client"

import { BottomSheet, GenericWrapper, Navigate, ObserverHeader, FancyImage } from "@components";
import { TabContainer, TabList } from "@components/ui/Tabs";
import { getThreadById } from "@lib/helpers/common";
import { getQueryKeys, numberConverter } from "@lib/utils";
import { Thread as ThreadType } from "@type/internal";
import EllipsisButton from "./EllipsisButton";
import ActionsButton from "./ActionButtons";
import ThreadDetailSheet from "./ThreadDetailSheet";

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
            <ObserverHeader
                navTitle={name}
                titleToShare={`Check out a thread on "${name}" on Parlocula`}
                OptionButton={<EllipsisButton creator={created_by} tid={_id} />}
                headerClasses="flex flex-col md:flex-row mb-4">

                <div>
                    <FancyImage
                        download={`Poster of thread "${name}" - Parlocula`}
                        id="thread-poster"
                        className="size-32 object-cover rounded-full"
                        src={poster}
                        height={128} width={128}
                        alt="Poster"
                    />

                    <h1 data-observe className="text-2xl mt-3 sm:text-4xl uppercase font-semibold">{name}</h1>

                    <ul className="flex gap-2 text-xs text-zinc-500">
                        {nsfw && (
                            <li className="list-[circle] px-2 py-2 rounded-full bg-purple-500 bg-opacity-50 text-zinc-100">NSFW</li>
                        )}
                        <li>
                            <Navigate comp="link" goto={`${_id}/members`}>{numberConverter(member_count)} Members</Navigate>
                        </li>
                        <li className="list-[circle]">Posts: {numberConverter(post_count)}</li>
                    </ul>

                    <p className="mt-2 line-clamp-2">{description}</p>

                    <div className="mt-2">
                        <BottomSheet className="text-sm" button="See more">
                            <ThreadDetailSheet
                                connections={connections}
                                createdAt={createdAt}
                                creator={creator}
                                description={description}
                                edited_by={edited_by}
                                links={links}
                                managers={managers}
                            />
                        </BottomSheet>
                    </div>
                </div>

                <div className="mt-4">
                    <ActionsButton uid={uid} thread={{ _id, name, poster }} />
                </div>

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