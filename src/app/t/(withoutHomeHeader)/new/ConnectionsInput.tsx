import { XmarkIcon } from "@assets/Icons";
import GeneralTile from "@components/GeneralTile";
import { CloseButton } from "@components/Modal";
import SearchContainer from "@components/SearchContainer";
import { searchAllContent } from "@lib/contentFetcher";
import { getPoster } from "@lib/utils";
import { RefinedSearchData } from "@type/external";
import { ThreadConnectionType } from "@type/schemas";
import { useState } from "react";

const ConnectionsInput = ({ callback }: { callback: (arg: any) => void }) => {

    const [connections, setConnections] = useState<ThreadConnectionType[]>([]);

    const returnConnections = () => {
        callback(connections);
    }

    const queryFn = async (query: string, page: number) => {
        const response = await searchAllContent(query, page);
        if (!response) return { results: [], total_results: 0, total_pages: 0, page }
        return response;
    }

    const getConnections = (c: ThreadConnectionType) => {
        const connectionSet = new Set(connections);
        connectionSet.add(c);
        if (connectionSet.size === connections.length) return;
        setConnections(Array.from(connectionSet));
    }

    const removeConnection = (path: string) => {
        setConnections(connections.filter(e => e.path !== path));
    }

    const SearchWrapper = ({ children }: { children: React.ReactNode }) => {
        return (
            <div style={{ justifyContent: "flex-start" }} className="stretchContainer flex-col group bg-primarylight overflow-y-auto">
                {children}
                <div className="hidden w-full group-has-[#infiniteScroller]:flex mt-auto gap-4 sticky bottom-0 py-2 bg-inherit">
                    <ul className="flex gap-3 flex-1 overflow-x-auto noScroll">
                        {connections.map(({ path, name }) => (
                            <li key={path} className="inline-flex text-sm gap-3 whitespace-nowrap text-nowrap flex-cntr-between px-2 py-2 rounded-md bg-gray20 border border-gray30">
                                <span>{name}</span>
                                <button type="button" onClick={() => removeConnection(path)}>
                                    <XmarkIcon className="size-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <CloseButton onClick={returnConnections} className="primary ml-auto">Done</CloseButton>
                </div>
            </div>
        )
    }

    const SearchTile = ({ id, image, media_type, name }: RefinedSearchData) => {
        const poster = image ? getPoster({ external: true, type: "poster", path: image, size: "w92" }) : undefined
        if (!poster || !["person", "movie", "show"].includes(media_type)) return null;
        return <GeneralTile
            title={name}
            onClick={() => getConnections({ name, path: id, type: media_type as "person" | "movie" | "show" })}
            poster={poster}
        />
    }

    return <SearchContainer
        ComponentToShow={SearchTile}
        queryFn={queryFn}
        queryKeys={(q) => ["search", "connection", q]}
        Wrapper={SearchWrapper}
    />

}

export default ConnectionsInput;