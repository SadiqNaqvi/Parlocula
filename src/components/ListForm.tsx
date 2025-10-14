"use client";

import { listClientSchema } from "@lib/schemas";
import { InputMediaType } from "@type/schemas";
import { Form, Input, ToggleButton } from "./form";
import useCurrentUser from "@store/user";
import { createList } from "@lib/helpers/client";
import Navigate from "./Navigate";
import { CloseButton } from "./FancyboxModal";
import { Fancybox } from "@fancyapps/ui";
import toast from "react-hot-toast";

const ListForm = ({ defaultVals, medias, callback }: { defaultVals?: any, medias: InputMediaType[], callback?: (arg: any) => void }) => {

    const { user } = useCurrentUser();

    if (!user) return (
        <div className="bg-primary border border-dashed border-gray30 rounded-md flex flex-col gap-4 flex-cntr-all">
            <p>You need to log-in to do this.</p>
            <Navigate goto="/join" role="button" comp="link">Join Now</Navigate>
        </div>
    )

    const submit = (formdata: any) => {
        console.log(formdata);
        if (!medias.length) return;
        const data = { ...formdata, items: medias }
        callback?.(data);
        createList(data, user._id);
        toast.success("Added to list.")
        Fancybox.close(true);
    }

    return (
        <section className="bg-primary border border-dashed border-gray30 rounded-md space-y-4 p-6 w-full max-w-[500px]">

            <Form defaultVals={defaultVals} submit={submit} schema={listClientSchema} className="space-y-3">
                <Input
                    name="name"
                    placeholder="Eg: Horror Movies"
                    label="name"
                    required
                />
                <ToggleButton
                    name="isPrivate"
                    label="Private"
                    className="capitalize w-full"
                />
                <button type="submit" className="primary mt-4">Create</button>
            </Form>

            <p className="text-sm text-zinc-500 text-center">Note: A list without at least one item would be automatically deleted.</p>
        </section>
    )
}

export default ListForm;