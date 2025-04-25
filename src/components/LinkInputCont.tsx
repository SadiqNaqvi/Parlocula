
"use client";
import { linkSchema } from "@lib/schemas";
import { LinkSchema } from "@type/schemas";
import { Form, Input } from "./form";
import { CloseButton } from "./Modal";

const LinkInputCont = ({ func, classes = "", }: { func: any, classes?: string, }) => {

    const submitLink = (data: LinkSchema) => {
        func(data);
    }

    return (
        <Form
            className={"w-96 max-w-full *:w-full text-inherit p-2 rounded-md bg-primarylight border border-dashed border-gray-500" + " " + classes}
            submit={submitLink}
            schema={linkSchema}
        >
            <Input
                required
                name="label"
                placeholder="label"
            />
            <Input
                required
                name="path"
                placeholder="path"
            />

            <CloseButton className="secondary mt-4" type="submit">Add</CloseButton>
        </Form>
    )
}

export default LinkInputCont;