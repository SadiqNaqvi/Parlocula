"use client";

import { queryFilters } from "@lib/constants";
import { QueryFilterType } from "@type/other";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

type Props = ({
    type: QueryFilterType,
    className?: undefined,
    filters?: undefined,
    onActive?: undefined,
} | {
    type: "custom",
    className?: string,
    onActive?: string,
    filters: { id: string, label: string }[]
})

const FilterTiles = ({ type, className, filters, onActive }: Props) => {
    const router = useRouter();
    const params = useSearchParams();
    const filterParam = params.get("f") || '';
    const pathname = usePathname();
    const availableFilters = type === "custom" ? filters : queryFilters[type].map(el => ({ id: el, label: el }));
    const currentFilter = availableFilters.find(filter => filter.id === filterParam)?.id ?? availableFilters[0].id;

    const updateFilter = (filterId: string) => {
        if (params.get('f') === filterId) return;
        const urlParams = new URLSearchParams(params.toString());
        filterId ? urlParams.set('f', filterId) : urlParams.delete('f');
        router.replace(pathname + '?' + urlParams.toString());
    }

    return (
        <ul className="flex gap-2 overflow-x-auto noScroll">
            {availableFilters.map(({ id, label }) => (
                <li
                    key={id}
                    onClick={() => updateFilter(id)}
                    className={`${className ?? "py-2 px-3 bg-gray20 rounded-2xl"} pointer text-sm capitalize min-w-fit ${currentFilter === id ? `${onActive ?? "bg-secondary color-primary"}` : ""}`}>
                    {label.replaceAll('_', ' ')}
                </li>
            ))}
        </ul>
    )
}

export default FilterTiles;