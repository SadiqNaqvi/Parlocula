"use client";

import { ForwardedRef, forwardRef, MutableRefObject, Ref, useImperativeHandle, useState } from "react";
import { Form, Input } from "./form";
import GeneralTile from "./GeneralTile";
import InfiniteScroller from "./InfiniteScroller";
import { GeneralMultipleReturn } from "@type/internal";
import { CheckBoxIcon, EmptyBoxIcon } from "@assets/Icons";

type Props = {
    queryKeys: (q: string) => string[],
    queryFn: (query: string, page: number) => Promise<GeneralMultipleReturn>,
    inputPlaceholder?: string;
    refiner: (resp: any) => { title: string, poster?: string, id: string }
}

export type ListSelectorRef = () => string[];

const ListSelector = forwardRef(({ queryFn, queryKeys, inputPlaceholder, refiner }: Props, ref: Ref<ListSelectorRef>) => {

    const [query, setQuery] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState<Map<string, boolean>>(new Map());

    useImperativeHandle<ListSelectorRef, ListSelectorRef>(ref, () => () => selectedParticipants.keys().toArray());

    const updateQuery = (data: { query: string }) => {
        const input = data.query;

        if (!input || input.length < 3) return;

        setQuery(input);
    }

    const handleSelection = (id: string) => {
        let temp = new Map(selectedParticipants);
        if (selectedParticipants.has(id)) temp.delete(id);
        else temp.set(id, true);

        setSelectedParticipants(temp);
    }

    const component = (response: any) => {
        const { id, title, poster } = refiner(response);
        return (
            <GeneralTile
                title={title}
                poster={poster}
                onClick={() => handleSelection(id)}
                showCheckBox
                checked={selectedParticipants.has(id)}
                className="pointer w-full"
            />
        );
    }

    return (
        <>
            <Form submit={updateQuery}>
                <Input defaultValue={query} name="query" placeholder={inputPlaceholder || "Search here"} />
            </Form>

            <InfiniteScroller
                Component={component}
                queryKeys={queryKeys(query)}
                fetchData={(p) => queryFn(query, p)}
                enabled={!!query}
            />
        </>
    )

})

export default ListSelector;