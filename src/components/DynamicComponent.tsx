"use client";







import { useQueryHook } from "@lib/hooks";
import { getQueryKeys, isValidObjectId, queryFunction } from "@lib/utils";
import { GeneralGetReturn } from "@type/internal";
import { LoadingSpinner, NotFound, ShowError } from "./ui";
import { getQueryClient } from "@lib/queryClient";

type HookResult = Record<string, unknown>;

type QueryProps = {
    queryKeys: (string | number)[],
    queryFn: (...args: any) => Promise<GeneralGetReturn>,
    args: any[],
}

type Props<T, P, H extends HookResult = {}> = {
    component: (data: T, props: P, hooks: H) => JSX.Element,
    getQueryProps: (props: P) => QueryProps,
    getHooks?: () => H;
}

const DynamicComponent = <T, P extends { id?: string, [key: string]: any }, H extends HookResult = {}>(
    { component, getQueryProps, getHooks }: Props<T, P, H>
) => {
    return (props: P) => {

        const objectId = props.id?.split('-')[0];

        if (objectId && !isValidObjectId(objectId)) return (
            <NotFound
                title="Oops! Look's like you came across a wrong path."
                paras={["Content id is incorrect", "Please go back and try again."]}
            />
        );

        const { args, queryFn, queryKeys } = getQueryProps({ ...(props ?? {}), id: objectId });

        const { data, error, isFetching, refetch } = useQueryHook<T>({
            queryFn: () => queryFunction(queryFn, args), queryKeys
        });

        const hooks = getHooks?.() ?? ({} as H);

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

        return component(data, props, hooks);
    }
}

export default DynamicComponent;