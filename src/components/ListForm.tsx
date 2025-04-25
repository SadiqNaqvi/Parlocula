"use client";

import { listClientSchema } from "@lib/schemas";
import { InputMediaType } from "@type/internal";
import { Form, Input, ToggleButton } from "./form";
import useCurrentUser from "@store/user";
import { createList } from "@lib/helpers/client";
import Navigate from "./Navigate";

const ListForm = ({ defaultVals, medias, callback }: { defaultVals?: any, medias: InputMediaType[], callback?: (arg: any) => void }) => {

    const { user, setUserHash } = useCurrentUser();

    if (!user) return (
        <div className="bg-primary border border-dashed border-gray30 rounded-md flex flex-col gap-4 flex-cntr-all">
            <p>You need to log-in to do this.</p>
            <Navigate goto="/join" role="button" comp="link">Join Now</Navigate>
        </div>
    )

    const submit = async (formdata: any) => {
        if (!medias.length) return;
        const data = { ...formdata, items: medias }
        callback?.(data);
        return createList(data, user, setUserHash);
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
                    label="isPrivate"
                    className="capitalize"
                />
                <button type="submit" className="primary mt-4">Create</button>
            </Form>

            <p className="text-sm text-zinc-500 text-center">Note: A list without at least one item would be automatically deleted.</p>
        </section>
    )
}

export default ListForm;