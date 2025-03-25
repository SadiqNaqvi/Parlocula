"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { postTags } from "@lib/constants";
import { TagSchemaType, tagSchema } from "@lib/schemas";
import { useForm } from "react-hook-form";

const ThreadTagList = ({ func, defaultTag = "", ...props }: { func: any, defaultTag?: string } & React.HTMLAttributes<HTMLElement>) => {

    const { handleSubmit, register } = useForm<TagSchemaType>({
        resolver: zodResolver(tagSchema),
        defaultValues: { tag: defaultTag }
    });

    const submitTag = (data: TagSchemaType, event: any) => {
        func(data.tag);
        if (event.target.hasAttribute("popover")) event.target.hidePopover();
    }

    return (
        <form
            {...props}
            className="bg-primary text-inherit w-96 border border-dashed rounded-md p-4 border-gray-500"
            onSubmit={handleSubmit(submitTag)}>
            {postTags.map(el => (
                <label key={el} className="w-full pointer py-4 border-b border-gray30 flex flex-cntr-between" htmlFor={el || "none"}>
                    <span>{el || "None"}</span>
                    <input
                        id={el || "none"}
                        value={el}
                        type="radio"
                        defaultChecked={el === defaultTag}
                        {...register("tag")}
                        className="size-4 pointer"
                        name="tag" />

                </label>
            ))}

            <button className="ml-auto secondary mt-6" type="submit">Apply</button>
        </form>
    )

}

export default ThreadTagList;