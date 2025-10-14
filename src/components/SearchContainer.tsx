"use client";

import React, { PropsWithChildren, useRef, useState } from "react";
import InfiniteScroller from "./InfiniteScroller";
import { GeneralGetReturn, GeneralMultipleReturn, InfiniteQueryResponse } from "@type/internal";
import { ClickableActionTile, NormalCheckTile } from "./form/CheckAndRadioTile";
import { queryFunction } from "@lib/utils";
import toast from "react-hot-toast";
import { XmarkIcon } from "@assets/Icons";
import Modal from "./FancyboxModal";

type Props = {
    placeholderSection?: React.ReactNode,
    ComponentToShow: React.ComponentType<any>,
    Loading?: React.ComponentType<any>,
    queryFn: (query: string, p: number,) => Promise<GeneralMultipleReturn>,
    queryKeys: (q: string) => (string | number)[],
    additional?: any,
    callback?: ((arg: any) => any),
    Wrapper?: (a: { children: React.ReactNode, [key: string]: any }) => React.JSX.Element
}

const SearchContainer = ({ placeholderSection, ComponentToShow, queryFn, Loading, queryKeys, additional, callback, Wrapper }: Props) => {

    const [query, setQuery] = useState('');

    const updateQuery = (data: FormData) => {
        const queryParam = data.get("query") as string | null;
        if (!queryParam || queryParam.length < 3) return;
        setQuery(queryParam);
    }

    const queryFunction = async (p: number) => {
        return await queryFn(query, p);
    }

    const PlaceholderComponent = () => {
        return (
            placeholderSection ??
            <span>Search something to see the result here</span>
        )
    }

    const DefaultWrapper = ({ children }: { children: React.ReactNode }) => {
        if (Wrapper) return <Wrapper>{children}</Wrapper>
        return <React.Fragment>{children}</React.Fragment>
    }

    return (
        <div className={`size-[600px] px-2 rounded-md bg-primarylight border border-dashed border-zinc-500`}>
            <header className="w-full mb-3 py-2 bg-primarylight sticky top-0">
                <form action={updateQuery} className="w-full">
                    <input
                        type="search"
                        name="query"
                        className="py-2 w-full block px-4 bg-gray30 rounded-md"
                        placeholder="Search here (minimum 3 characters required)"
                    />
                </form>
            </header>
            <DefaultWrapper>
                {query ?
                    <InfiniteScroller
                        Component={ComponentToShow}
                        fetchData={queryFunction}
                        queryKeys={queryKeys(query)}
                        Loading={Loading}
                        additional={additional}
                        callback={callback}
                        paginate={false}
                    />
                    :
                    <section className="size-full">
                        <PlaceholderComponent />
                    </section>
                }
            </DefaultWrapper>
        </div>
    )

}

export default SearchContainer;

type ActionProps<T> = {
    action: (arr: T[]) => unknown,
    actionButton: React.ReactNode,
    children: React.ReactNode,
    queryFn: (query: string, p: number,) => Promise<GeneralGetReturn>,
    queryKeys: (q: string) => (string | number)[],
    limit?: number,
    placeholder?: string,
    sanitize: (d: T) => {
        label: string,
        data: unknown,
        poster?: string,
    },
}

export const ActionSearchContainer = <T,>({ action, sanitize, children, actionButton, queryFn, queryKeys, limit, placeholder }: ActionProps<T>) => {

    const dataMap = useRef<Map<string, T>>(new Map());
    const [labelArr, setLabelArr] = useState<string[]>([]);

    const removeData = (label: string) => {
        dataMap.current.delete(label);
        setLabelArr(labelArr.filter(l => l !== label));
    }

    const updateDataMap = ({ data, label }: { data: T, label: string }) => {
        if (Boolean(dataMap.current.get(label))) return removeData(label);
        else if (limit && labelArr.length >= limit) return toast.error(`Only ${limit} items can be selected`)
        dataMap.current.set(label, data);
        setLabelArr([...labelArr, label]);
    }

    const submit = () => {
        if (labelArr.length)
            action(Array.from(dataMap.current.values()));
    }

    const CheckTile = (d: T) => {
        const sanitized = sanitize(d);
        const { label } = sanitized;
        return <ClickableActionTile
            action={d => updateDataMap({ data: d as T, label })}
            checked={Boolean(dataMap.current.get(label))}
            key={label}
            {...sanitized} />
    }

    const Wrapper = ({ children }: PropsWithChildren) => {

        return (
            <div className="relative forceCenter">
                {children}
                {Boolean(labelArr.length) && (
                    <footer className="flex gap-2 items-center fixed bottom-0">
                        <div className="flex-1">
                            <ul className="w-full flex gap-2 overflow-x-auto">
                                {labelArr.map(l => (
                                    <li key={l} className="px-2 py-2 bg-gray20 rounded-md text-nowrap">
                                        <span>{l}</span>
                                        <button onClick={() => removeData(l)} className="border border-gray40 rounded-md p-2">
                                            <XmarkIcon className="size-2" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button
                            onClick={submit}
                            className="px-3 py-2 rounded-md bg-secondary color-primary">
                            {actionButton}
                        </button>
                    </footer>
                )}
            </div>
        )

    }

    return (
        <Modal buttonChildren={children} id="actionSearchContainer">
            <SearchContainer
                ComponentToShow={CheckTile}
                queryFn={queryFn}
                queryKeys={queryKeys}
                Wrapper={Wrapper}
                placeholderSection={placeholder}
            />
        </Modal>
    )
}