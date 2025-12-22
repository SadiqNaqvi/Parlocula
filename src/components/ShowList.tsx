import { PaginatedData } from "@type/external";
import { GeneralGetReturn, GeneralMultipleReturn } from "@type/internal";
import { useState } from "react";

type QueryFnReturn<T> = Promise<GeneralMultipleReturn<T> | GeneralGetReturn<PaginatedData<T>>>

export type ShowListProps<T> = {
    Component: React.ComponentType<T>,
    queryKeysForSearch: (q: string) => string[],
    queryKeys: string[],
    queryFn: () => QueryFnReturn<T>,
    queryFnForSearch: (query: string, page: number) => QueryFnReturn<T>,
    inputPlaceholder?: string;
}

const ShowList = () => {

    const [section, setSection] = useState("")

}

export default ShowList;