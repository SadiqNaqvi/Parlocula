
"use client";
import { zodResolver } from "@hookform/resolvers/zod"
import { LinkSchema, linkSchema } from "@lib/schemas"
import { useForm } from "react-hook-form"

const LinkInputCont = ({ func, classes = "", ...props }: { func: any, classes?: string, } & React.HTMLAttributes<HTMLFormElement>) => {

    const { register, handleSubmit, reset, formState: { errors } } = useForm<LinkSchema>({
        resolver: zodResolver(linkSchema)
    });

    const submitLink = (data: LinkSchema, event: any) => {
        func(data);
        reset();
        if (event.target.hasAttribute("popover")) event.target.hidePopover();
    }

    return (
        <form
            {...props}
            className={"w-96 max-w-full *:w-full text-inherit p-2 rounded-md bg-primarylight border border-dashed border-gray-500" + " " + classes}
            onSubmit={handleSubmit(submitLink)}>
            <input type="text"
                required
                minLength={5}
                maxLength={20}
                className="px-2 py-3 bg-gray20"
                placeholder="label"
                {...register("label")} />
            {errors.label &&
                <p className="my-2 text-red-500">{errors.label.message?.toString()}</p>
            }

            <input type="text"
                required
                minLength={15}
                maxLength={100}
                className="px-2 py-3 bg-gray20 mt-4"
                placeholder="url"
                {...register("url")} />
            {errors.url &&
                <p className="my-2 text-red-500">{errors.url.message?.toString()}</p>
            }

            <button className="secondary mt-4" type="submit">Add</button>
        </form>
    )
}

export default LinkInputCont;