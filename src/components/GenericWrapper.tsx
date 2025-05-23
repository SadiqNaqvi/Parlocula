"use client";

import { useQueryHook } from "@lib/hooks";
import { isValidObjectId, queryFunction } from "@lib/utils";
import { GeneralGetReturn } from "@type/internal";
import { LoadingSpinner, NotFound, ShowError } from "./ui";

type QueryProps = {
    queryKeys: (string | number)[],
    queryFn: (...args: any) => Promise<GeneralGetReturn>,
    args: any[],
}

type Props<T, P> = {
    component: (data: T, props: P) => JSX.Element,
    getQueryProps: (props: P) => QueryProps,
    props: P,
}

const GenericWrapper = <T, P extends { id?: string, [key: string]: any }>(
    { component, getQueryProps, props }: Props<T, P>
) => {

    const objectId = props.id?.split('-')[0];

    const { args, queryFn, queryKeys } = getQueryProps({ ...(props ?? {}), id: objectId });

    const { data, error, isFetching, refetch } = useQueryHook<T>({
        queryKeys, queryFn: () => queryFunction(queryFn, args),
        enabled: Boolean(objectId ? isValidObjectId(objectId) : true),
    });

    if (objectId && !isValidObjectId(objectId)) return (
        <NotFound
            title="Oops! Look's like you came across a wrong path."
            paras={["Content id is incorrect", "Please go back and try again."]}
        />
    );


    if (isFetching) return (
        <div className="size-screen">
            <LoadingSpinner />
        </div>
    )

    else if (error) return (
        <ShowError
            heading="Oops! Looks like we could'nt proceed"
            errCode={error.message}
            retry={() => refetch()}
        />
    )

    else if (!data) return (
        <NotFound
            title="Oops! Looks like the popcorn is missing."
            paras={["Reason: The resource you're looking for might have been deleted.", "Please search it using it's name, title, username, etc. in the explore page."]}
        />
    )

    return component(data, props);
}

export default GenericWrapper;