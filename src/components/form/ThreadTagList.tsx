"use client";

import { CloseButton } from "@components/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { postTags } from "@lib/constants";
import { tagSchema } from "@lib/schemas";
import { useForm } from "react-hook-form";

const ThreadTagList = ({ func, defaultTag = "" }: { func: any, defaultTag?: string }) => {

    const { handleSubmit, register } = useForm({
        resolver: zodResolver(tagSchema),
        defaultValues: { tag: defaultTag }
    });

    const submitTag = (data: any) => {
        func(data.tag);
    }

    return (
        <form
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

            <div className="justify-end mt-6 flex gap-3">
                <CloseButton type="button" onClick={() => func("")}>Clear</CloseButton>
                <CloseButton className="secondary" type="button">Cancel</CloseButton>
                <CloseButton className="primary" type="submit">Apply</CloseButton>
            </div>

        </form>
    )

}

export default ThreadTagList;