'use client';

import { setUserOnRefreshOrLogin } from '@lib/helpers/user';
import { getQueryClient } from '@lib/providers/queryClient';
import { getQueryKeys } from '@lib/utils';
import useCurrentUser from '@store/user';
import { CurrentUser, TokenPayload } from '@type/internal';
import { useEffect } from 'react';

const UserHydrator = ({ payload }: { payload: TokenPayload | null }) => {

    const { clearUser, user, meta } = useCurrentUser();

    useEffect(() => console.log("user in userHydrator", user), [user]);
    useEffect(() => console.log("meta in userHydrator", meta), [meta]);

    useEffect(() => {
        if (!payload) {
            return clearUser();
        }

        const { username } = payload;

        const queryClient = getQueryClient();
        const qkeys = getQueryKeys("user_username", { username });
        let userToStore: CurrentUser | null = null;
        // This would return the user object or undefined. It would return undefined only if the user opened the web app offline.
        const prefetchedUser = queryClient.getQueryData<CurrentUser>(qkeys);

        // Update user hash with the freshly fetched user data.
        if (prefetchedUser) {
            userToStore = prefetchedUser;
        }
        else {

            // For offline
            // The Local Storage (indexed db here) may got cleared but we know that the user exists.
            if (!user) return;

            userToStore = user;
            queryClient.setQueryData(qkeys, user);
        }

        return setUserOnRefreshOrLogin(userToStore, payload.filterContent)

    }, []);

    return null;
}

export default UserHydrator;
