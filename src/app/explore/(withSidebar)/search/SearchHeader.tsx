"use client";

import { LeftChevron, SearchIcon } from "@assets/Icons";
import { searchFilters } from "@lib/constants";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Form, Input } from "../../../../components/form";
import Navigate from "../../../../components/Navigate";

export default function SearchHeader({ filter, initialQuery }: { initialQuery: string, filter: string }) {

    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    const updateQuery = (data: any) => {
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
        <header className="bg-[var(--primary)] sticky top-0 z-[2] pt-4 pb-2">
            <section className="flex items-center gap-2 md:gap-4">
                <Navigate comp="button" goto="back" className="smallBtn">
                    <LeftChevron />
                </Navigate>
                <Form
                    defaultVals={{ query: initialQuery }}
                    submit={updateQuery}
                    className="h-10 md:h-12 w-full rounded-md bg-[var(--gray20)] flex items-center gap-2 px-4">
                    <SearchIcon className="min-h-4 h-4 text-zinc-500" />
                    <Input
                        containerClasses="p-0 w-full border-0"
                        type="search"
                        name="query"
                        autoFocus
                        className="h-full w-full md:pb-[2px] bg-transparent"
                        placeholder="What are you looking for?"
                    />
                </Form>
            </section>
            <section className="mt-2 flex gap-4 noScroll overflow-x-auto bounceEffect overscroll-x-contain">
                {searchFilters.map(el => (
                    <button
                        key={el}
                        className={`relative border-0 border-b-2 capitalize px-2 py-2 ${filter === (el === "all" ? "" : el) ? "border-secondary" : "border-transparent"}`}
                        onClick={() => updateFilter(el)}
                    >
                        {el}
                    </button>
                ))}
            </section>
        </header >
    )
}