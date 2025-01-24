"use client";

import { CheckIcon, LeftChevron } from "@assets/Icons";
import OptionMenu from "./OptionMenu";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const RouterDropdown = ({ tabs }: { tabs: { label: string, value: string }[] }) => {
    const router = useRouter();
    const params = useSearchParams();
    const filter = params.get("f") || '';
    const currentFilter = tabs.find(tab => tab.value === filter) ?? tabs[0];
    const pathname = usePathname();

    const setFilter = (filter: string) => {
        const query = new URLSearchParams(params.toString());
        filter.trim() ? query.set('f', filter.trim()) : query.delete('f');
        router.replace(pathname + '?' + query.toString());
    }

    return (
        <OptionMenu controls="auto" place="end" className="smallBtn p-3 rounded-md flex gap-2 flex-cntr-all border border-gray30" ButtonElement={
            <>
                {currentFilter.label}
                <LeftChevron classnames="h-4 rotate-[270deg]" />
            </>
        }>
            {tabs.map(({ label, value }) => (
                <li
                    className="w-full list-none border-b border-gray30"
                    key={label}
                >
                    <button
                        onClick={() => setFilter(value)}
                        className="smallBtn capitalize py-3 px-4 w-full flex flex-cntr-between text-left md:hover-bg-gray20">
                        {label}
                        {value === currentFilter.value &&
                            <CheckIcon classnames="h-4" />
                        }
                    </button>
                </li>
            ))}
        </OptionMenu>
    )
}

export default RouterDropdown;