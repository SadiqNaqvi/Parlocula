"use client";

import { CheckIcon, LeftChevron } from "@assets/Icons";
import OptionMenu from "./OptionMenu";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { queryFilters } from "@lib/constants";
import { QueryFilterType } from "@type/other";
import { CloseButton } from "./Modal";

const FilterDropdown = ({ type }: { type: QueryFilterType }) => {
    const router = useRouter();
    const params = useSearchParams();
    const filterParam = params.get("f") || '';
    const availableFilters = queryFilters[type];
    const currentFilter = availableFilters.find(filter => filter === filterParam) ?? availableFilters[0];
    const pathname = usePathname();

    const setFilter = (filter: string) => {
        if (params.get('f') === filter) return;
        const urlParams = new URLSearchParams(params.toString());
        urlParams.set('f', filter);
        router.replace(pathname + '?' + urlParams.toString());
    }

    return (
        <OptionMenu id="filter-picker" controls="auto" className="smallBtn capitalize p-3 rounded-md flex gap-2 flex-cntr-all border border-gray30" ButtonElement={
            <>
                {currentFilter}
                <LeftChevron className="h-4 rotate-[270deg]" />
            </>
        }>
            {availableFilters.map((filter) => (
                <li
                    className="w-full list-none border-b border-gray30"
                    key={filter}
                >
                    <CloseButton
                        onClick={() => setFilter(filter)}
                        className="smallBtn capitalize py-3 px-4 w-full flex flex-cntr-between text-left md:hover-bg-gray20">
                        {filter}
                        {filter === currentFilter &&
                            <CheckIcon className="h-4" />
                        }
                    </CloseButton>
                </li>
            ))}
        </OptionMenu>
    )
}

export default FilterDropdown;