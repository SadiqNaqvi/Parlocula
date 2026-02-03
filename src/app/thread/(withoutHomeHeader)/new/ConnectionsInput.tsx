import { AddIcon, XmarkIcon } from "@assets/Icons";
import { BottomSheet, BottomSheetRef, ListSelector } from "@components";
import { ListSelectorRef, RefinedValues } from "@components/ListSelector";
import { OptionalChildren } from "@components/ui";
import { searchAllContent } from "@lib/contentFetcher";
import { RefinedSearchData } from "@type/external";
import { InputManagerType } from "@type/other";
import { ThreadConnectionType as CType } from "@type/schemas";
import { RefObject, useImperativeHandle, useRef, useState } from "react";

const refiner = ({ id, media_type, image, name }: RefinedSearchData): RefinedValues<CType> => ({
    id,
    title: name,
    poster: image,
    returnVal: {
        name: name,
        path: id,
        type: media_type
    } as CType
});

const sheetTitle = "";
const sheetDesc = ""

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
        setConnections([...connections, ...selectedConnections]);
    }

    return (
        <div className="flex flex-cntr-between">
            <OptionalChildren condition={connections.length} fallback={
                <h4 className="parloHeading">Connect it to Wikis</h4>
            }>
                <ul className="flex gap-3 flex-1 overflow-x-auto noScroll">
                    {connections.map(({ path, name }) => (
                        <li key={path} className="inline-flex text-sm gap-3 whitespace-nowrap text-nowrap flex-cntr-between px-2 py-1 rounded-md bg-gray10 border border-gray20">
                            <span>{name}</span>
                            <button className="p-1 bg-gray20 rounded-md" type="button" onClick={() => removeConnection(path)}>
                                <XmarkIcon className="size-2" />
                            </button>
                        </li>
                    ))}
                </ul>
            </OptionalChildren>

            <BottomSheet title={sheetTitle} description={sheetDesc} onClose={getConnections} ref={sheetRef} button={<AddIcon />}>
                <section className="p-2 sm:p-4">
                    <ListSelector
                        queryFn={searchAllContent}
                        queryKeys={(q) => ["search", "connection", q]}
                        refiner={refiner}
                        callbackRef={callbackRef}
                        className="min-h-[50dvh] my-2 space-y-4"
                        inputPlaceholder="Search Movies, Shows or Artists"
                    />
                </section>
            </BottomSheet>
        </div>
    )
}

ConnectionsInput.displayName = "ConnectionsInput";

export default ConnectionsInput;