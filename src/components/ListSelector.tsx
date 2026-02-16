"use client";

import appToast from "@lib/providers/toast";
import { Frame } from "@type/internal";
import {
    FunctionComponent,
    RefObject,
    useCallback,
    useImperativeHandle,
    useMemo,
    useState,
} from "react";
import GeneralTile from "./GeneralTile";
import InfiniteScroller, { InfiniteScrollerProps } from "./InfiniteScroller";
import SearchInList, { QueryFnReturn } from "./SearchInList";

/* ---------------------------------- Types --------------------------------- */

export type ListSelectorRef<R = string> = () => R[];

export type RefinedValues<R = unknown> = {
    title: string;
    poster: string | Frame | undefined;
    id: string;
    returnVal?: R;
};

type Response = { _id?: string; id?: string;[key: string]: unknown };

type BaseProps<R> = {
    inputPlaceholder?: string;
    callbackRef: RefObject<ListSelectorRef<R>>;
    limit?: number;
    className?: string;
    alreadySelectedValues?: { id: string, val?: R }[]
};

type InfiniteQueryProps<T, R> = {
    mode: "infinite";
    queryKeysForList: string[];
    queryFnForList: (p: number) => QueryFnReturn<T>;
    returnIds?: boolean;
    refiner: (resp: T) => RefinedValues<R>;
};

type SearchQueryProps<T, R> = {
    mode: "search";
    queryKeys: (q: string) => string[];
    queryFn: (query: string, page: number) => QueryFnReturn<T>;
    queryKeysForList?: string[];
    queryFnForList?: (p: number) => QueryFnReturn<T>;
    returnIds?: boolean;
    refiner: (resp: T) => RefinedValues<R>;
};

type StaticComponentProps<T, R> = {
    mode: "static-component";
    data: T[];
    Component: FunctionComponent<
        T & {
            checked: boolean;
            onClick: (v: R) => void;
        }
    >;
};

type StaticRefinerProps<T, R> = {
    mode: "static-refiner";
    data: T[];
    returnIds?: boolean;
    refiner: (data: T) => RefinedValues<R>;
};

type Props<T extends Response, R> = BaseProps<R> &
    (InfiniteQueryProps<T, R> |
        SearchQueryProps<T, R> |
        StaticComponentProps<T, R> |
        StaticRefinerProps<T, R>) &
    Partial<Pick<InfiniteScrollerProps, "NotFoundSection" | "notFoundMessage">>;

/* -------------------------------- Component -------------------------------- */

const ListSelector = <T extends Response, R>(
    props: Props<T, R>
) => {
    const {
        callbackRef,
        className,
        inputPlaceholder,
        limit,
        NotFoundSection,
        notFoundMessage,
        mode,
        alreadySelectedValues
    } = props;

    /* --------------------------- Selection State --------------------------- */

    const [selectedMap, setSelectedMap] = useState<Map<string, R | true>>(() => new Map(alreadySelectedValues?.map(({ id, val }) => [id, val ?? true])) || []);

    /* -------------------------- Imperative Handle -------------------------- */

    const handleReturn = useCallback((): R[] => {
        if ("returnIds" in props && props.returnIds) {
            return Array.from(selectedMap.keys()) as R[];
        }
        return Array.from(selectedMap.values()) as R[];
    }, [selectedMap, props]);

    useImperativeHandle(callbackRef, () => handleReturn, [handleReturn]);

    /* ----------------------------- Selection ----------------------------- */

    const handleSelection = useCallback(
        (action: "add" | "remove", id: string, returnVal?: R) => {
            setSelectedMap((prev) => {
                const next = new Map(prev);

                if (action === "remove") {
                    next.delete(id);
                    return next;
                }

                else if (limit && next.size >= limit) {
                    appToast.error(`Only ${limit} selections are allowed.`);
                    return prev;
                }

                next.set(id, returnVal ?? true);
                return next;
            });
        },
        [limit]
    );

    /* ------------------------- Render Item Function ------------------------ */

    const renderItem = useCallback(
        (response: T) => {
            const uid = (response.id || response._id) ?? "";
            const checked = selectedMap.has(uid);

            // Static Component Mode
            if (mode === "static-component") {
                const { Component } = props;
                return (
                    <Component
                        key={uid}
                        {...response}
                        checked={checked}
                        onClick={(v: R) => handleSelection(checked ? "remove" : "add", uid, v)}
                    />
                );
            }

            // Refiner-based modes
            else if (
                mode === "static-refiner" ||
                mode === "infinite" ||
                mode === "search"
            ) {
                const { id, title, poster, returnVal } = props.refiner(response);

                return (
                    <GeneralTile
                        key={id}
                        title={title}
                        poster={poster}
                        showCheckBox
                        checked={checked}
                        onClick={() => handleSelection(checked ? "remove" : "add", id, returnVal)}
                        className="pointer w-full"
                    />
                );
            }

            return null;
        },
        [props, selectedMap, handleSelection]
    );

    /* ------------------------------ Render ------------------------------ */

    if (mode === "infinite") return (
        <InfiniteScroller
            Component={renderItem}
            fetchData={props.queryFnForList}
            queryKeys={props.queryKeysForList}
            className={className}
            NotFoundSection={NotFoundSection}
            notFoundMessage={notFoundMessage}
        />
    );

    else if (mode === "search") return (
        <SearchInList
            Component={renderItem}
            queryFn={props.queryFn}
            queryKeys={props.queryKeys}
            queryFnForList={props.queryFnForList}
            queryKeysForList={props.queryKeysForList}
            inputPlaceholder={inputPlaceholder}
            className={className}
            NotFoundSection={NotFoundSection}
            notFoundMessage={notFoundMessage}
        />
    );

    else if (
        (mode === "static-component" ||
            mode === "static-refiner") &&
        props.data.length
    ) return (
        <ul>{props.data.map(renderItem)}</ul>
    )

    return null;
};

export default ListSelector;
