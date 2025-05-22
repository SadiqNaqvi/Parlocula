'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useCurrentUser from '@store/user';
import { getQueryKeys } from '@lib/utils';
import { fetchCurrentUser } from '@lib/helpers/common';

const UserHydrator = () => {
    const {
        isHydrated,
        clearUser,
        getUserFromHash,
        setUser,
        setUserHash,
        user,
    } = useCurrentUser();

    const queryClient = useQueryClient();

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
