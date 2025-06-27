"use client";

import { queryFilters } from "@lib/constants";
import { QueryFilterType } from "@type/other";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";

type Props = ({
    type: QueryFilterType
} | {
    type: "custom",
    className: string,
    filters: { id: string, label: string }[]
})

const FilterTiles = (props: Props) => {
    const { type } = props;
    const router = useRouter();
    const params = useSearchParams();
    const filterParam = params.get("f") || '';
    const pathname = usePathname();
    const availableFilters = type === "custom" ? props.filters : queryFilters[type];
    const currentFilter = availableFilters.find(filter => filter === filterParam) ?? availableFilters[0];
}