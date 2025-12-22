import { AddIcon, XmarkIcon } from "@assets/Icons";
import { BottomSheet, BottomSheetRef, ListSelector } from "@components";
import { ListSelectorRef, RefinedValues } from "@components/ListSelector";
import { searchAllContent } from "@lib/contentFetcher";
import { RefinedSearchData } from "@type/external";
import { InputManagerType } from "@type/other";
import { ThreadConnectionType as CType } from "@type/schemas";
import { RefObject, useImperativeHandle, useRef, useState } from "react";

const refiner = (data: RefinedSearchData): RefinedValues<CType> => ({
    id: data.id,
    title: data.name,
    poster: data.image,
    returnVal: {
        name: data.name,
        path: data.id,
        type: data.media_type
    } as CType
});

const ConnectionsInput = ({ defaultConnections, connectionsRef }: { defaultConnections?: CType[], connectionsRef: RefObject<InputManagerType<CType[]>> }) => {

    const [connections, setConnections] = useState<CType[]>(defaultConnections ?? []);
    const callbackRef = useRef<ListSelectorRef<CType>>(null);
    const sheetRef = useRef<BottomSheetRef>();

    useImperativeHandle<InputManagerType<CType[]>, InputManagerType<CType[]>>(connectionsRef, () => ({
        getData: () => connections,
    }));

    const removeConnection = (path: string) => {
        setConnections(connections.filter(e => e.path !== path));
    }

    const getConnections = () => {
        const selectedConnections = callbackRef.current?.();
        if (!selectedConnections || !selectedConnections.length) return;
        setConnections(selectedConnections);
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
                                <button className="p-1 bg-gray20" type="button" onClick={() => removeConnection(path)}>
                                    <XmarkIcon className="size-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )
            }
            <BottomSheet onClose={getConnections} ref={sheetRef} button={<AddIcon />}>
                <ListSelector
                    queryFn={searchAllContent}
                    queryKeys={(q) => ["search", "connection", q]}
                    refiner={refiner}
                    callbackRef={callbackRef}
                    inputPlaceholder="Search Movies, Shows or Artists"
                />
            </BottomSheet>
        </div>
    )
}

ConnectionsInput.displayName = "ConnectionsInput";

export default ConnectionsInput;