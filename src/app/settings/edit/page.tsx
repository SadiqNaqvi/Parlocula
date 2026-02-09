"use client";

import UserMutationPage from "@components/form/Mutation/UserMutation";
import { LoadingSpinner } from "@components/ui";
import useCurrentUser from "@store/user";

const UserProfileEditPage = () => {

    const { user, isHydrated } = useCurrentUser();

    if (!isHydrated) return <LoadingSpinner />
    else if (!user) return null;

    return <UserMutationPage isEditing defaultValues={user} />

}

export default UserProfileEditPage;