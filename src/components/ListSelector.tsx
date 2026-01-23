"use client";

import appToast from "@lib/providers/toast";
import { PaginatedData } from "@type/external";
import { Frame, GeneralGetReturn, GeneralMultipleReturn } from "@type/internal";
import { RefObject, useImperativeHandle, useState } from "react";
import GeneralTile from "./GeneralTile";
import SearchInList, { QueryFnReturn } from "./SearchInList";
import InfiniteScroller from "./InfiniteScroller";

export type ListSelectorRef<R = string> = () => R[];
export type RefinedValues<R = unknown> = {
    title: string,
    poster: string | Frame | undefined,
    id: string,
    returnVal?: R,
}

type Props<T, R> = {
    inputPlaceholder?: string;
    callbackRef: RefObject<ListSelectorRef<R>>,
    limit?: number;
    returnIds?: boolean,
    refiner: ((resp: T) => RefinedValues<R>) | undefined,
    queryKeys: ((q: string) => string[]) | undefined,
    queryFn: ((query: string, page: number) => QueryFnReturn<T>) | undefined,
    queryKeysForList?: string[],
    queryFnForList?: (p: number) => QueryFnReturn<T>,
    data?: RefinedValues[];
    className?: string;
}

const ListSelector = <T, R>({ queryFn, queryKeys, data, className, inputPlaceholder, refiner, callbackRef, limit, returnIds, queryFnForList, queryKeysForList }: Props<T, R>) => {

    const [selectedParticipants, setSelectedParticipants] = useState<Map<string, any>>(new Map());

    const handleReturn = (): R[] => {
        if (returnIds) {
            return selectedParticipants.keys().toArray() as R[]
        } else {
            return selectedParticipants.values().toArray();
        }
    }

    useImperativeHandle<ListSelectorRef<R>, ListSelectorRef<R>>(callbackRef, () => handleReturn);

    const handleSelection = (id: string, returnVal: any) => {
        let temp = new Map(selectedParticipants);
        console.log(returnVal);

        if (selectedParticipants.has(id))
            temp.delete(id);

        else if (limit && selectedParticipants.size >= limit)
            return appToast.error(`Only ${limit} selections are allowed.`)

        else temp.set(id, returnVal || true);

        setSelectedParticipants(temp);
    }

    const Component = (response: any) => {
        if (!refiner) return;
        const { id, title, poster, returnVal } = refiner(response);
        return (
            <GeneralTile
                title={title}
                poster={poster}
                onClick={() => handleSelection(id, returnVal)}
                showCheckBox
                checked={selectedParticipants.has(id)}
                className="pointer w-full"
            />
        );
    }

    if (queryKeysForList && queryFnForList) return (
        <InfiniteScroller
            Component={Component}
            fetchData={queryFnForList}
            queryKeys={queryKeysForList}
            className={className}
        />
    )

    else if (queryKeys && queryFn) return (
        <SearchInList
            Component={Component}
            queryFn={queryFn}
            queryKeys={queryKeys}
            queryKeysForList={queryKeysForList}
            queryFnForList={queryFnForList}
            inputPlaceholder={inputPlaceholder}
            className={className}
        />
    )

    else if (data && data.length) return (
        <ul>
            {data.map(({ id, title, poster, returnVal }) => (
                <GeneralTile
                    key={id}
                    title={title}
                    poster={poster}
                    onClick={() => handleSelection(id, returnVal)}
                    showCheckBox
                    checked={selectedParticipants.has(id)}
                    className="pointer w-full"
                />
            ))}
        </ul>
    )

}

export default ListSelector;