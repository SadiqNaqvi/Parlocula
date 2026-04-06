"use client";

import { Navbar } from "@components";
import { Form, Input, Password } from "@components/form";
import { LoadingSpinner } from "@components/ui";
import { updateUsername } from "@lib/helpers/mutations";
import { usernameUpdateSchema } from "@lib/schemas";
import { getTimeInFuture } from "@lib/utils";
import useCurrentUser from "@store/user";
import { useRouter } from "next/navigation";

const Page = () => {
    const { user, isHydrated } = useCurrentUser();
    const navigation = useRouter();

    if (!isHydrated) return <LoadingSpinner />
    else if (!user) return null;

    const { username, usernameUpdatedAt } = user;
    const canUpdate = Boolean(usernameUpdatedAt && Date.now() > getTimeInFuture({ unit: "mo", from: usernameUpdatedAt }))

    if (!canUpdate) return (
        <>
            <Navbar navTitle="Edit Username" />
            <p className="mt-4">
                You cannot update your username for now since you have already updated it within a month. Please try again after a month.
            </p>
        </>

    )

    const submit = async (data: { username: string, passkey: string }) => {
        const { success, error } = await updateUsername(data);
        if (!success) return error;
        navigation.push(`/user/${data.username.trim()}`);
    }

    return (
        <>
            <Navbar navTitle="Edit Username" />
            <Form className="space-y-4" defaultVals={{ username }} submit={submit} schema={usernameUpdateSchema}>
                <Input name="username" placeholder="Username" />
                <Password name="passkey" placeholder="Passkey" />

                <button type="submit" className="primary">Update</button>

                <p>Username can be updated only once in a month. Username is your identity and changing it may lead to others unable to find you unless they know your new username. Be sure before updating it.</p>
            </Form>
        </>
    )
}
export default Page;