"use client";

import { BottomSheet, ListSelector, ListSelectorRef } from "@components";
import { searchTaleonsOnly } from "@lib/contentFetcher";
import { addItemsInShelf } from "@lib/helpers/mutations";
import { ExtSearchDataTaleonOnly } from "@type/external";
import { useRef } from "react";
import { twMerge } from "tailwind-merge";

const AddItemsButton = ({ sid, uid, className }: { sid: string, uid: string, className?: string }) => {

    const callbackRef = useRef<ListSelectorRef<ExtSearchDataTaleonOnly>>(null);

    const handleSubmit = async () => {
        const items = callbackRef.current?.();
        if (!items || !items.length) return;
        await addItemsInShelf(sid, uid, items.map(({ media_type, poster, title, tmdb_id, year }) => ({
            poster,
            ext_id: tmdb_id,
            taleon_type: media_type,
            title,
            year,
        })));
    }

    return (
        <BottomSheet onClose={handleSubmit} button="Add Items" className={twMerge("primary", className)}>
            <section className="px-2">
                <ListSelector
                    mode="search"
                    callbackRef={callbackRef}
                    queryFn={searchTaleonsOnly}
                    queryKeys={(q) => ["search", "taleonOnly", q]}
                    refiner={(data) => ({
                        id: data.tmdb_id,
                        title: data.title,
                        poster: data.poster,
                        returnVal: data,
                    })}
                />
            </section>
        </BottomSheet>
    )

}

export default AddItemsButton;