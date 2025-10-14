"use client"

import { GenericWrapper, Navigate } from "@components";
import FancyImage from "@components/FancyImage";
import ObserverHeader from "@components/ObserverHeader";
import { TabContainer, TabList } from "@components/ui/Tabs";
import { getThreadById } from "@lib/helpers/common";
import { getQueryKeys, numberConverter, timeAgo } from "@lib/utils";
import { Thread as ThreadType } from "@type/internal";
import JoinButton from "./JoinButton";

type Props = { id: string, uid?: string }

const getQueryProps = ({ id }: Props) => ({
    queryKeys: getQueryKeys("thread_id", { id }),
    queryFn: getThreadById,
    args: [id],
});

const Thread = (props: Props) => {
    const component = (data: ThreadType, { id, uid }: Props) => {

        const { _id, connection, creator, createdAt, created_by, description, links, member_count, nsfw, poster, post_count, name, managers } = data;

        const isMod = uid ? Boolean(created_by === uid || (managers ?? []).find(m => m === uid)) : false

        return (
            <>
                <ObserverHeader
                    navTitle={name}
                    titleToShare={`Check out ${name} thread on Popcorn Paragon`}
                    headerClasses="flex flex-col md:flex-row mb-4">
                    <div>
                        <FancyImage
                            download={`Poster of thread ${name} - Popcorn Paragon`}
                            id="thread-poster"
                            className="size-32 object-cover rounded-full"
                            src={poster}
                            height={128} width={128}
                            alt="Poster"
                        />

                        <h1 data-observe className="text-2xl mt-3 sm:text-4xl uppercase font-semibold">{name}</h1>

                        <ul className="flex space-x-3 text-xs text-zinc-500">
                            <li>
                                <Navigate comp="link" goto={`${_id}/members`}>{numberConverter(member_count)} Members</Navigate>
                            </li>
                            <li>{numberConverter(post_count)} Posts</li>
                            <li className="list-[circle]">{timeAgo(createdAt)}</li>
                        </ul>

                        <p className="mt-2 line-clamp-2">{description}</p>
                    </div>

                    <div className="mt-4 md:mt-0 md:ml-auto">
                        <JoinButton uid={uid} isMod={isMod} tid={_id} />
                    </div>

                </ObserverHeader>

                <TabContainer className="my-4">
                    <TabList href={`/t/${id}`}>Posts</TabList>
                    <TabList href={`/t/${id}/frames`}>Frames</TabList>
                    <TabList href={`/t/${id}/links`}>Links</TabList>
                </TabContainer>
            </>
        )

    }

    return <GenericWrapper component={component} getQueryProps={getQueryProps} props={props} />
};

export default Thread;