"use client";

import { ListSelector, ListSelectorRef, Navbar } from "@components";
import { searchTaleonsOnly } from "@lib/contentFetcher";
import { ExtSearchDataTaleonOnly, RefinedSearchData } from "@type/external";
import { TaleonType } from "@type/internal";
import { useRef } from "react";

const AddItems = ({ sid, uid }: { sid: string, uid: string }) => {

    const callbackRef = useRef<ListSelectorRef<ExtSearchDataTaleonOnly>>(null);

    const handleSubmit = ()=>{
        const items = callbackRef.current?.();
        if(!items|| !items.length) return;
        
    }

    return (
        <>
            <Navbar
                navTitle="Add Items in Shelf"
                OptionButton={
                    <button className="primary">Add</button>
                }
            />
            <section className="mt-4">
                <ListSelector
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
        </>
    )

}

export default AddItems;