import { NotFound } from "@components/ui";
import { isValidParloId } from "@lib/utils";
import { ParloPageProps } from "@type/other";
import { PropsWithChildren } from "react";


const ShelfLayout = async ({ children, params }: PropsWithChildren<ParloPageProps>) => {

    const awaitedParams = await params;
    const lid = awaitedParams.id.split('-')[0];
    
    const isCorrectId = isValidParloId(lid);
    console.log("isCorrectId in /shelf/id layout", isCorrectId);

    if (!isCorrectId) return (
        <NotFound
            title="Oops! Looks like you came across a wrong path."
            paras={["Shelf id is incorrect", "Please search the shelf by name in the explore page."]}
        />
    );

    return (
        <main>{children}</main>
    )
}

export default ShelfLayout;