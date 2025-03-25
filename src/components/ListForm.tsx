"use client";

import { listClientSchema } from "@lib/schemas";
import { Form, Input, Poster, Textarea, ToggleButton } from "./form";
import { useState } from "react";
import MediaInputCont from "./MediaInputCont";
import { InputFrame } from "@type/internal";
import { createList } from "@lib/actions/clientActions";
import { readyFrames } from "@lib/utils";

const ListForm = ({ defaultVals, media_id }: { defaultVals?: any, media_id?: string }) => {

    const [poster, setPoster] = useState<InputFrame | null>(null);

    const submit = async (formdata: any) => {
        console.log(formdata);
        // const data = { ...formdata, ...readyFrames(poster ? [poster] : []), items: media_id ? [media_id] : [] }
        // return createList(data, user, setUserHash);
    }

    const getPoster = (poster: InputFrame[]) => {
        setPoster(poster[0]);
    }

    return (
        <>
            <Form defaultVals={defaultVals} submit={submit} schema={listClientSchema} className="space-y-3 p-2 w-full max-w-screen-sm">
                <div className="flex items-center gap-4">
                    <Poster
                        picture={poster?.url || ""}
                        removePicture={() => setPoster(null)}
                        className="size-40"
                    />

                    <Input
                        name="title"
                        placeholder="Eg: Horror Movies"
                        label="Title"
                        required
                    />

                </div>
                <Textarea
                    name="description"
                    placeholder="Describe the list for visitors"
                    label="Description"
                />
                <ToggleButton
                    label="private"
                    className="capitalize"
                />
                <button type="submit" className="bigBtn primary">Create</button>
            </Form>
            <MediaInputCont popover="auto" id="poster-picker" type="image" callback={getPoster} />
        </>
    )
}

export default ListForm;