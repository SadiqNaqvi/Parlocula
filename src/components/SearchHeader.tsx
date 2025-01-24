"use client";

import { LeftChevron, SearchIcon } from "@assets/Icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Navigate from "./Navigate";
import { useForm } from "react-hook-form";

export default function SearchHeader() {

    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();
    const searchQuery = params.get('q') || '';
    const filter = params.get('f') || '';

    const filters = [
        { label: 'all', link: '' },
        { label: 'movie', link: 'movie' },
        { label: 'show', link: 'show' },
        { label: 'thread', link: 'thread' },
        { label: 'person', link: 'person' },
        { label: 'user', link: 'user' },
        { label: 'collection', link: 'collection' },
        { label: 'company', link: 'company' }
    ]

    const currentFilter = filters.find(el => el.link === filter)?.link ?? '';

    const { register, handleSubmit } = useForm({
        defaultValues: {
            query: searchQuery,
        }
    })

    const updateQuery = (data: any) => {
        const { query } = data;
        const search = new URLSearchParams(params.toString());
        query.trim() ? search.set('q', query.trim()) : search.delete('q');
        router.replace(pathname + '?' + search.toString());
    }

    const updateFilter = (value: string) => {
        const search = new URLSearchParams(params.toString());
        value.trim() ? search.set('f', value.trim()) : search.delete('f');
        router.replace(pathname + '?' + search.toString());

    }

    return (
        <header className="bg-[var(--primary)] sticky top-0 z-[2] pt-4 pb-2">
            <section className="flex items-center gap-2 md:gap-4">
                <Navigate comp="button" goto="back" className="smallBtn">
                    <LeftChevron />
                </Navigate>
                <form
                    onSubmit={handleSubmit(updateQuery)}
                    className="h-10 md:h-12 w-full rounded-md bg-[var(--gray20)] flex items-center gap-2 px-4">
                    <SearchIcon classnames="min-h-4 h-4 text-zinc-500" />
                    <input
                        {...register("query")}
                        type="search"
                        autoFocus
                        className="h-full w-full md:pb-[2px] bg-transparent"
                        placeholder="What are you looking for?"
                    />
                </form>
            </section>
            <section className="mt-2 flex gap-4 noScroll overflow-x-auto bounceEffect overscroll-x-contain">
                {filters.map(el => (
                    <button
                        key={el.label}
                        className={`smallBtn relative border-0 border-b-2 capitalize px-2 py-2 ${currentFilter === el.link ? "border-secondary" : "border-transparent"}`}
                        onClick={() => updateFilter(el.link)}
                    >
                        {el.label}
                    </button>
                ))}
            </section>
        </header >
    )
}