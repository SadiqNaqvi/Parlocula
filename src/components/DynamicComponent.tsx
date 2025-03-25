import { isValidObjectId } from "@lib/utils";
import { GeneralGetReturn } from "@type/internal";
import { NotFound, ShowError } from "./ui";

type PropsType = { params: { id: string }, searchParams: any }

const DynamicComponent = (component: (data: any, props: PropsType) => JSX.Element, dataFunc: (...args: any) => Promise<GeneralGetReturn>) => {
    return async function (props: PropsType) {
        const objectId = props.params.id?.split('-')[0];
        if (objectId && !isValidObjectId(objectId)) return (
            <NotFound
                title="Oops! Look's like you came across a wrong path."
                paras={["Post id is incorrect", "Please go back and try again."]}
            />
        )

        const { errCode, result, success } = await dataFunc(props);
        if (!success) return (
            <ShowError
                heading="Oops! Looks like we could'nt proceed"
                errCode={errCode}
            />
        )

        else if (!result) return (
            <NotFound
                title="Oops! Looks like the popcorn is missing."
                paras={["Reason: The resource you're looking for might have been deleted.", "Please search it using it's name, title, username, etc. in the explore page."]}
            />
        )
        return component(result, props)
    }
}

export default DynamicComponent;