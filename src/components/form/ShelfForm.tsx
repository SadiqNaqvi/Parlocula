"use client";

import { createShelfMutation } from "@lib/helpers/mutations";
import { shelfClientSchema } from "@lib/schemas";
import useCurrentUser from "@store/user";
import { CinementSchemaType } from "@type/schemas";
import { Form, Input, ToggleButton } from ".";
import LoginModal from "../fallbacks/LoginModal";

const ShelfForm = ({ defaultVals, cinements, callback }: { defaultVals?: any, cinements: CinementSchemaType[], callback?: (arg: any) => void }) => {

    const { meta } = useCurrentUser();

    if (!meta) return (
        <LoginModal skipFullScreen />
    )

    const submit = async (formdata: { name: string, isPrivate: boolean }) => {

        if (!cinements.length) return;

        const data = { ...formdata, items: cinements }

        callback?.(data);

        return await createShelfMutation(meta.user_id, data);
    }

    return (
        <section className="bg-primary border border-dashed border-gray30 rounded-md space-y-4 p-6 w-full max-w-[500px]">

            <Form defaultVals={defaultVals} submit={submit} schema={shelfClientSchema} className="space-y-3">
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

        </section>
    )
}

export default ShelfForm;