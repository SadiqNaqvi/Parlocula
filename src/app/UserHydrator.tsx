'use client';

import { fetchCurrentUser } from '@lib/helpers/common';
import { getQueryClient } from '@lib/queryClient';
import { getQueryKeys } from '@lib/utils';
import useCurrentUser from '@store/user';
import { useEffect } from 'react';

const UserHydrator = () => {
    const {
        isHydrated,
        clearUser,
        getUserFromHash,
        setUser,
        setUserHash,
        user,
    } = useCurrentUser();

    const queryClient = getQueryClient();

    useEffect(() => {
        if (!isHydrated) return;
        const user = getUserFromHash();

        if (!user) return;

        setUser(user);
        if (user.object_expiry < Date.now()) {
            fetchCurrentUser(user._id)
                .then(({ result, success, errCode }) => {
                    if (!success && errCode === "pp202") clearUser();
                    else if (success && result) setUserHash(result);
                });
        }

    }, [isHydrated]);

    useEffect(() => {
        if (user) queryClient.setQueryData(getQueryKeys("user_username", { username: user.username }), user);
    }, [user, queryClient]);

    return null;
}

export default UserHydrator;
