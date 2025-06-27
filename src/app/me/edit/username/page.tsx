"use client";

import { Navbar } from "@components";
import { Form, Input, Password } from "@components/form";
import { LoadingSpinner } from "@components/ui";
import { updateUsername } from "@lib/helpers/client";
import { getQueryClient } from "@lib/queryClient";
import { usernameUpdateSchema } from "@lib/schemas";
import { getTimeInFuture } from "@lib/utils";
import useCurrentUser from "@store/user";

const Page = () => {
    const { user, isHydrated, setUserHash } = useCurrentUser();
    const queryClient = getQueryClient();

    if (!isHydrated) return <LoadingSpinner />
    else if (!user) return null;

    const { username, usernameUpdatedAt } = user;
    const canUpdate = Boolean(usernameUpdatedAt && Date.now() > getTimeInFuture({ unit: "mo", from: usernameUpdatedAt }))

    const submit = async (data: { username: string, passkey: string }) => {
        if (!canUpdate) return;
        await updateUsername(user._id, data, setUserHash, queryClient);
    }

    return (
        <>
            <Navbar navTitle="Edit Username" />
            <Form className="space-y-4" defaultVals={{ username }} submit={submit} schema={usernameUpdateSchema}>
                <Input name="username" placeholder="Username" />
                <Password name="passkey" placeholder="Passkey" />

                <button type="submit" className="primary">Update</button>

                {canUpdate ?
                    <p>Username can be updated only once in a month. Username is your identity and changing it may lead to users unable to find you unless they know your new username. Be sure before updating it.</p>
                    :
                    <p>You cannot update your username for now. Please try again after a month.</p>
                }
            </Form>
        </>
    )
}
export default Page;