"use client";

import { LeftChevron, SearchIcon } from "@assets/Icons";
import { searchFilters } from "@lib/constants";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Form, Input } from "@components/form";
import Navigate from "@components/Navigate";

export default function SearchHeader({ filter }: { filter: string }) {

    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    const updateQuery = (data: { query: string }) => {
        const { query } = data;
        const search = new URLSearchParams(params.toString());
        query.trim() ? search.set('q', query.trim()) : search.delete('q');
        router.replace(pathname + '?' + search.toString());
    }

    const updateFilter = (value: string) => {
        const search = new URLSearchParams(params.toString());
        value.trim() && value !== "all" ? search.set('f', value.trim()) : search.delete('f');
        router.replace(pathname + '?' + search.toString());
    }

    return (
        <header className="fullScreen bg-primary border-b border-gray20 sticky top-0 z-[2] pt-2 px-2">
            <section className="flex items-center">
                <Navigate comp="button" goto="back" className="smallBtn">
                    <LeftChevron />
                </Navigate>
                <Form
                    skipReset
                    submit={updateQuery}
                    className="h-10 md:h-12 w-full flex items-center gap-2 pl-2">

                    <SearchIcon className="size-4 text-zinc-500" />

                    <Input
                        type="search"
                        name="query"
                        defaultValue={params.get("q") || undefined}
                        autoFocus
                        className="h-full w-full border-0 p-0"
                        containerClasses="w-full h-full"
                        placeholder="What are you looking for?"
                    />
                </Form>
            </section>
            <section className="mt-2 flex gap-4 noScroll overflow-x-auto bounceEffect overscroll-x-contain">
                {searchFilters.map(el => (
                    <button
                        key={el}
                        className={`relative border-0 border-b-2 capitalize px-2 py-2 ${filter === el ? "border-secondary" : "border-transparent"}`}
                        onClick={() => updateFilter(el)}
                    >
                        {el}
                    </button>
                ))}
            </section>
        </header >
    )
}