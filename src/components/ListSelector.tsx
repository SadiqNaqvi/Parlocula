"use client";

import appToast from "@lib/providers/toast";
import { Frame } from "@type/internal";
import { FunctionComponent, RefObject, useImperativeHandle, useState } from "react";
import GeneralTile from "./GeneralTile";
import InfiniteScroller, { InfiniteScrollerProps } from "./InfiniteScroller";
import SearchInList, { QueryFnReturn } from "./SearchInList";

export type ListSelectorRef<R = string> = () => R[];
export type RefinedValues<R = unknown> = {
    title: string,
    poster: string | Frame | undefined,
    id: string,
    returnVal?: R,
}

type Resposne = { _id?: string, id?: string, [key: string]: unknown }

type BaseProps<R> = {
    inputPlaceholder?: string;
    callbackRef: RefObject<ListSelectorRef<R>>,
    limit?: number;
    className?: string;
}

type InfiniteQueryProps<T, R> = {
    queryKeysForList: string[],
    queryFnForList: (p: number) => QueryFnReturn<T>,
    returnIds?: boolean,
    refiner: ((resp: T) => RefinedValues<R>) | undefined,
}

type SearchQueryProps<T, R> = {
    refiner: ((resp: T) => RefinedValues<R>),
    queryKeys: ((q: string) => string[]),
    queryFn: ((query: string, page: number) => QueryFnReturn<T>),
}

type DefinedDataProps<T, R> = ({
    data: T[];
    Component: FunctionComponent<T & {
        checked: boolean | undefined,
        onClick: (v: R) => void,
    }>,
} | {
    data: T[];
    refiner: (data: T) => RefinedValues
})

type Props<T extends Resposne, R> = BaseProps<R> & (
    InfiniteQueryProps<T, R>
    | SearchQueryProps<T, R>
    | DefinedDataProps<T, R>
) & Partial<Pick<InfiniteScrollerProps, "NotFoundSection" | "notFoundMessage">>

const ListSelector = <T extends Resposne, R>(props: Props<T, R>) => {

    const { NotFoundSection, notFoundMessage, callbackRef, className, inputPlaceholder, limit } = props;

    const [selectedParticipants, setSelectedParticipants] = useState<Map<string, any>>(new Map());

    const handleReturn = (): R[] => {
        if ("returnIds" in props && props.returnIds) {
            return selectedParticipants.keys().toArray() as R[]
        } else {
            return selectedParticipants.values().toArray();
        }
    }

    useImperativeHandle<ListSelectorRef<R>, ListSelectorRef<R>>(callbackRef, () => handleReturn);

    const handleSelection = (id: string, returnVal?: any) => {
        let temp = new Map(selectedParticipants);

        if (selectedParticipants.has(id))
            temp.delete(id);

        else if (limit && selectedParticipants.size >= limit)
            return appToast.error(`Only ${limit} selections are allowed.`)

        else temp.set(id, returnVal || true);

        setSelectedParticipants(temp);
    }

    const ComponentToUse = (response: T) => {

        if ("Component" in props) {
            const { Component } = props;
            const { _id, id } = response;
            const uid = id || _id || "";
            return (
                <Component
                    checked={selectedParticipants.get(uid)}
                    onClick={() => handleSelection(uid)}
                    {...response}
                />
            )
        }

        if ("refiner" in props && props.refiner) {
            const { id, title, poster, returnVal } = props.refiner(response);
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
    }

    if ("queryKeysForList" in props && "queryFnForList" in props) return (
        <InfiniteScroller
            Component={ComponentToUse}
            fetchData={props.queryFnForList}
            queryKeys={props.queryKeysForList}
            className={className}
            NotFoundSection={NotFoundSection}
            notFoundMessage={notFoundMessage}
        />
    )

    else if ("queryKeys" in props && "queryFn" in props) return (
        <SearchInList
            Component={ComponentToUse}
            queryFn={props.queryFn}
            queryKeys={props.queryKeys}
            queryKeysForList={undefined}
            queryFnForList={undefined}
            inputPlaceholder={inputPlaceholder}
            className={className}
            NotFoundSection={NotFoundSection}
            notFoundMessage={notFoundMessage}
        />
    )

    else if ("data" in props && props.data.length) (
        <ul>
            {props.data.map((content, i) => (
                <ComponentToUse {...content} key={content._id || content.id} />
            ))}
        </ul>
    )

}

export default ListSelector;