"use client";

import { useQueryHook } from "@lib/hooks";
import { isValidObjectId, queryFunction } from "@lib/utils";
import useCurrentUser from "@store/user";
import { GeneralGetReturn, GeneralMultipleReturn } from "@type/internal";
import Navigate from "./Navigate";
import { NotFound, ShowError } from "./ui";
import { FullPageLoadingSpinner } from "./ui/LoadingSpinner";

type Func = (...args: any[]) => Promise<GeneralGetReturn | GeneralMultipleReturn>
type QueryProps<F extends Func = Func> = {
    queryKeys: (string | number)[],
    queryFn: F,
    args: Parameters<F>,
    onSuccess?: (d: any) => void
}

type PropType = { id?: string, [key: string]: any } | null

type Props<T, P extends PropType> = {
    getQueryProps: (props: P) => QueryProps,
    placeholderData?: T,
    props: P,
    needUser?: boolean,
} & ({
    component: (data: T | null | undefined, props: P) => JSX.Element | null,
    skipNotFound: true,
} | {
    component: (data: T, props: P) => JSX.Element,
    skipNotFound?: undefined | false,
})


const GenericWrapper = <T, P extends PropType>(
    { component, getQueryProps, props, needUser, skipNotFound, placeholderData }: Props<T, P>
) => {
    const objectId = props?.id?.split('-')[0];
    const userObj = needUser ? useCurrentUser() : null;

    const { args, queryFn, queryKeys, onSuccess } = getQueryProps({ ...(props ?? {}), id: objectId } as P);

    const { data, error, isLoading, refetch } = useQueryHook<T>({
        queryKeys, queryFn: () => queryFunction(queryFn, args) as Promise<T | null>,
        enabled: Boolean(objectId ? isValidObjectId(objectId) : true) && Boolean(needUser ? userObj?.user : true),
        onSuccess,
        placeholderData,
    });

    if (objectId && !isValidObjectId(objectId)) return (
        <NotFound
            title="Oops! Look's like you came across a wrong path."
            paras={["Content id is incorrect", "Please go back and try again."]}
        />
    );

    if (isLoading || (needUser && userObj?.isHydrated)) return (
        <FullPageLoadingSpinner />
    )

    else if (needUser && !userObj?.user) return (
        <section className="size-screen space-y-4">
            <ShowError heading="You need to log-in to proceed" />
            <Navigate comp="link" goto="/join" className="primary">Log in</Navigate>
        </section>
    )

    else if (error) return (
        <ShowError
            heading="Oops! Looks like we could'nt proceed"
            errCode={error.message}
            retry={() => refetch()}
        />
    )

    else if (!data && !skipNotFound) return (
        <NotFound
            title="Oops! Looks like the popcorn is missing."
            paras={["Reason: The resource you're looking for might have been deleted.", "Please search it using it's name, title, username, etc. in the explore page."]}
        />
    )

    return component(data as T, props);
}

export default GenericWrapper;