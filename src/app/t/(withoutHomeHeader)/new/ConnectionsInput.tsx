import { AddIcon, XmarkIcon } from "@assets/Icons";
import GeneralTile from "@components/GeneralTile";
import Modal, { CloseButton } from "@components/FancyboxModal";
import SearchContainer from "@components/SearchContainer";
import { searchAllContent } from "@lib/contentFetcher";
import { getPoster } from "@lib/utils";
import { RefinedSearchData } from "@type/external";
import { ThreadConnectionType as CType } from "@type/schemas";
import { forwardRef, useImperativeHandle, useState } from "react";

const ConnectionsInput = forwardRef(({ defaultConnections }: { defaultConnections?: CType[] }, ref) => {

    const [connections, setConnections] = useState<CType[]>(defaultConnections ?? []);

    useImperativeHandle(ref, () => ({
        getDate: () => connections,
    }));

    const queryFn = async (query: string, page: number) => {
        const response = await searchAllContent(query, page);
        if (!response) return { results: [], total_results: 0, total_pages: 0, page }
        return response;
    }

    const getConnections = (c: CType) => {
        if (connections.find(e => e.path === c.path)) return;
        setConnections([...connections, c]);
    }

    const removeConnection = (path: string) => {
        setConnections(connections.filter(e => e.path !== path));
    }

    const SearchWrapper = ({ children }: { children: React.ReactNode }) => {
        return (
            <div style={{ justifyContent: "flex-start" }} className="forceCenter flex-col group bg-primarylight overflow-y-auto">
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

    return (
        <div className="flex flex-cntr-between">
            {Boolean(connections.length) ?
                (
                    <h4 className="text-xl font-semibold">Add Connections</h4>
                )
                :
                (
                    <ul className="flex gap-3 flex-1 overflow-x-auto noScroll">
                        {connections.map(({ path, name }) => (
                            <li key={path} className="inline-flex text-sm gap-3 whitespace-nowrap text-nowrap flex-cntr-between px-2 py-2 rounded-md bg-gray20 border border-gray30">
                                <span>{name}</span>
                                <button className="p-2 bg-gray30" type="button" onClick={() => removeConnection(path)}>
                                    <XmarkIcon className="size-2" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )
            }
            <Modal id="connections-input" buttonChildren={<AddIcon />}>
                <SearchContainer
                    ComponentToShow={SearchTile}
                    queryFn={queryFn}
                    queryKeys={(q) => ["search", "connection", q]}
                    Wrapper={SearchWrapper}
                />
            </Modal>
        </div>
    )
})

export default ConnectionsInput;