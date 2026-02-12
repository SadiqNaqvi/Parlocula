"use client";

import { EditIcon } from "@assets/Icons";
import { ParloImage, ShowOnlyShelfItem } from "@components/ui";
import { MockupButton } from "@components/ui/mockup";
import { createShelfMutation } from "@lib/helpers/mutations";
import { shelfClientSchema } from "@lib/schemas";
import { getPoster } from "@lib/utils";
import useCurrentUser from "@store/user";
import { TaleonSchemaType } from "@type/schemas";
import { Form, Input, ToggleButton } from ".";
import LoginModal from "../fallbacks/LoginModal";

const ShelfForm = ({ defaultVals, taleons, callback }: { defaultVals?: any, taleons: TaleonSchemaType[], callback?: (arg: any) => void }) => {

    const { meta } = useCurrentUser();

    if (!meta) return (
        <LoginModal skipFullScreen />
    )

    const submit = async (formdata: { name: string, isPrivate: boolean }) => {

        if (!taleons.length) return;

        const data = { ...formdata, items: taleons }

        callback?.(data);

        return await createShelfMutation(meta.user_id, data);
    }

    return (
        <div className="customize w-full max-w-screen-md mx-auto h-screen">
            <Form defaultVals={defaultVals} submit={submit} schema={shelfClientSchema} className="space-y-3">
                <div className="mb-4 flex flex-cntr-between py-2 border-b border-gray30">
                    <h3 className="font-semibold">Create New Shelf</h3>

                    <button type="submit" className="primary">Create</button>
                </div>
                <header className="mb-4 pb-4 border-b border-gray30">
                    <section className="flex gap-4 items-center">

                        <ParloImage
                            height={128}
                            width={128}
                            className="object-cover min-w-24 size-24 sm:min-w-32 sm:size-32 rounded-full"
                            alt={`Poster of Shelf`}
                            frame={getPoster({ external: true, type: "poster", path: taleons[0].poster, size: "w185" })}
                        />

                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-1">
                                <EditIcon className="text-zinc-500 size-5" />
                                <Input
                                    type="text"
                                    name="name"
                                    placeholder="Name - Eg: Fav Horror Movies"
                                    autoFocus
                                    containerClasses="flex-1"
                                    minLength={3}
                                    maxLength={40}
                                    className="border-0 p-0 text-xl font-semibold w-full"
                                />
                            </div>
                            <p className="text-sm text-zinc-500">Created by @{meta.username}</p>
                        </div>

                    </section>

                    <ul className="mt-4 flex items-center gap-2">
                        <li>
                            <ToggleButton
                                name="isPrivate"
                                label="Private"
                                className="capitalize w-full"
                            />
                        </li>
                        <li className="w-[2px] h-stretch bg-zinc-500 rounded-md"></li>
                        <li className="text-sm text-zinc-500">Created: Now</li>
                        <li className="text-sm list-[circle] text-zinc-500">Items: {taleons.length}</li>
                    </ul>

                    <div className="mt-4 flex gap-2">
                        <MockupButton primary />
                        <MockupButton />
                    </div>
                </header>
                <ul>
                    {taleons.map(taleon => (
                        <li key={taleon.taleon_id}>
                            <ShowOnlyShelfItem {...taleon} />
                        </li>
                    ))}
                </ul>
            </Form>

        </div>
    )
}

export default ShelfForm;